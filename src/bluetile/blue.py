#!/usr/bin/env python

# IMPORT
from __future__ import print_function
import sys
import os
import time
import threading
from abc import abstractmethod

from blue_st_sdk.manager import Manager
from blue_st_sdk.manager import ManagerListener
from blue_st_sdk.node import NodeListener
from blue_st_sdk.feature import FeatureListener
from blue_st_sdk.features.audio.adpcm.feature_audio_adpcm import FeatureAudioADPCM
from blue_st_sdk.features.audio.adpcm.feature_audio_adpcm_sync import FeatureAudioADPCMSync
from websocket import create_connection
import json

# CONSTANTS

# Presentation message.
INTRO = """##################
# BlueST Example #
##################"""

# Bluetooth Scanning time in seconds (optional).
SCANNING_TIME_s = 7

# Tresh
TRESHOLD = 4000

# Debounce
DEBOUNCE = 20

P1 = "BCN-015"
P2 = "BCN-424"


# -- WS --
ws = create_connection("ws://localhost:3000")
ws.send(json.dumps({"type": "INIT", "data": {"name": "blue"}}))


# FUNCTIONS

#
# Printing intro.
#
def print_intro():
    print('\n' + INTRO + '\n')


# INTERFACES

#
# Implementation of the interface used by the Manager class to notify that a new
# node has been discovered or that the scanning starts/stops.
#
class MyManagerListener(ManagerListener):

    #
    # This method is called whenever a discovery process starts or stops.
    #
    # @param manager Manager instance that starts/stops the process.
    # @param enabled True if a new discovery starts, False otherwise.
    #
    def on_discovery_change(self, manager, enabled):
        print('Discovery %s.' % ('started' if enabled else 'stopped'))
        if not enabled:
            print()

    #
    # This method is called whenever a new node is discovered.
    #
    # @param manager Manager instance that discovers the node.
    # @param node    New node discovered.
    #
    def on_node_discovered(self, manager, node):
        print('New device discovered: %s.' % (node.get_name()))


#
# Implementation of the interface used by the Node class to notify that a node
# has updated its status.
#
class MyNodeListener(NodeListener):

    #
    # To be called whenever a node connects to a host.
    #
    # @param node Node that has connected to a host.
    #
    def on_connect(self, node):
        print('Device %s connected.' % (node.get_name()))

    #
    # To be called whenever a node disconnects from a host.
    #
    # @param node       Node that has disconnected from a host.
    # @param unexpected True if the disconnection is unexpected, False otherwise
    #                   (called by the user).
    #
    def on_disconnect(self, node, unexpected=False):
        print('Device %s disconnected%s.' %
              (node.get_name(), ' unexpectedly' if unexpected else ''))


#
# Implementation of the interface used by the Feature class to notify that a
# feature has updated its data.
#
class MyFeatureListener(FeatureListener):

    _debounce = 0

    #
    # To be called whenever the feature updates its data.
    #
    # @param feature Feature that has updated.
    # @param sample  Data extracted from the feature.
    #
    def on_update(self, feature, sample):
        x = feature.get_accelerometer_x(sample)
        y = feature.get_accelerometer_y(sample)
        z = feature.get_accelerometer_z(sample)
        treshold = abs(x) + abs(y) + abs(z)

        if (self._debounce > 0):
            self._debounce = self._debounce-1

        if (treshold > TRESHOLD and self._debounce == 0):

            player = "p1" if feature.get_parent_node().get_name() == P1 else "p2"

            dataToSend = {
                "type": "BLUE",
                "data": {
                    "player": player
                }
            }

            ws.send(json.dumps(dataToSend))
            self._debounce = DEBOUNCE


class DeviceThread(threading.Thread):
    """Class to handle a device in a thread."""

    def __init__(self, device, *args, **kwargs):
        """Constructor.

        Args:
            device (:class:`blue_st_sdk.node.Node`): The device to handle.
        """
        super(DeviceThread, self).__init__(*args, **kwargs)
        self._device = device

    def run(self):
        """Run the thread."""

        # Connecting to the device.
        self._device.add_listener(MyNodeListener())
        print('Connecting to %s...' % (self._device.get_name()))
        if not self._device.connect():
            print('Connection failed.\n')
            return

        # Getting features.
        features = self._device.get_features()

        feature = features[5]

        # Enabling notifications.
        feature_listener = MyFeatureListener()
        feature.add_listener(feature_listener)
        self._device.enable_notifications(feature)

        # Enabling notifications.
        """ for feature in features:
            # For simplicity let's skip audio features.
            if not isinstance(feature, FeatureAudioADPCM) and \
                    not isinstance(feature, FeatureAudioADPCMSync):
                feature.add_listener(MyFeatureListener())
                self._device.enable_notifications(feature) """

        # Getting notifications.
        while True:
            if self._device.wait_for_notifications(0.05):
                pass

    def get_device(self):
        """Get the handled device."""
        return self._device


# MAIN APPLICATION

#
# Main application.
#
def main(argv):

    # Printing intro.
    print_intro()

    try:
        # Creating Bluetooth Manager.
        manager = Manager.instance()
        manager_listener = MyManagerListener()
        manager.add_listener(manager_listener)

        # Synchronous discovery of Bluetooth devices.
        print('Scanning Bluetooth devices...\n')
        manager.discover(SCANNING_TIME_s)

        # Getting discovered devices.
        discovered_devices = manager.get_nodes()

        # Listing discovered devices.
        if not discovered_devices:
            print('No Bluetooth devices found. Exiting...\n')
            ws.close()
            sys.exit(0)
        print('Available Bluetooth devices:')
        i = 1
        for device in discovered_devices:
            print('%d) %s: [%s]' % (i, device.get_name(), device.get_tag()))
            i += 1

        # Selecting devices to connect.
        selected_devices = []
        while True:
            while True:
                choice = int(
                    input('\nSelect a device to connect to (\'0\' to finish): '))
                if choice >= 0 and choice <= len(discovered_devices):
                    break

            if choice == 0:
                break
            else:
                device = discovered_devices[choice - 1]
                selected_devices.append(device)
                print('Device %s added.' % (device.get_name()))

        device_threads = []
        if len(selected_devices) > 0:
            # Starting threads.
            print('\nConnecting to selected devices and getting notifications '
                  'from all their features ("CTRL+C" to exit)...\n')
            for device in selected_devices:
                device_threads.append(DeviceThread(device).start())
        else:
            # Exiting.
            manager.remove_listener(manager_listener)
            print('Exiting...\n')
            ws.close()
            sys.exit(0)

        # Getting notifications.
        while True:
            pass

    except KeyboardInterrupt:
        try:
            # Exiting.
            print('\nExiting...\n')
            ws.close()
            sys.exit(0)
        except SystemExit:
            ws.close()
            os._exit(0)


if __name__ == "__main__":

    main(sys.argv[1:])
