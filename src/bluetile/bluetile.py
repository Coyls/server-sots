#!/usr/bin/env python

from __future__ import print_function
import sys
import os
import time
from abc import abstractmethod

from blue_st_sdk.manager import Manager
from blue_st_sdk.manager import ManagerListener
from blue_st_sdk.node import NodeListener
from blue_st_sdk.feature import FeatureListener
from websocket import create_connection
import json
# from blue_st_sdk.features.feature_accelerometer import FeatureAccelerometer

# CONSTANTS

# Presentation message.
INTRO = """##################
# BlueST Example #
##################"""

# Bluetooth Scanning time in seconds (optional).
SCANNING_TIME_s = 5

# Number of notifications to get before disabling them.
NOTIFICATIONS = 10000

# Create ws
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
        if unexpected:
            # Exiting.
            print('\nExiting...\n')
            sys.exit(0)


#
# Implementation of the interface used by the Feature class to notify that a
# feature has updated its data.
#
class MyFeatureListener(FeatureListener):

    _notifications = 0
    """Counting notifications to print only the desired ones."""

    #
    # To be called whenever the feature updates its data.
    #
    # @param feature Feature that has updated.
    # @param sample  Data extracted from the feature.
    #
    def on_update(self, feature, sample):
        if self._notifications < NOTIFICATIONS:
            self._notifications += 1
            # print(feature.FEATURE_NAME)
            # print(feature.FEATURE_X_FIELD)
            # print(feature.read_accelerometer())
            # print(feature.extract_data())

            x = feature.get_accelerometer_x(sample)
            y = feature.get_accelerometer_y(sample)
            z = feature.get_accelerometer_z(sample)
            treshold = abs(x) + abs(y) + abs(z)

            if (treshold > 5500):
                dataToSend = {
                    "type": "BLUE",
                    "data": "true"
                }

                ws.send(json.dumps(dataToSend))

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

        while True:
            # Synchronous discovery of Bluetooth devices.
            print('Scanning Bluetooth devices...\n')
            manager.discover(SCANNING_TIME_s)

            # Alternative 1: Asynchronous discovery of Bluetooth devices.
            #manager.discover(SCANNING_TIME_s, True)

            # Alternative 2: Asynchronous discovery of Bluetooth devices.
            # manager.start_discovery()
            # time.sleep(SCANNING_TIME_s)
            # manager.stop_discovery()

            # Getting discovered devices.
            discovered_devices = manager.get_nodes()

            # Listing discovered devices.
            if not discovered_devices:
                print('No Bluetooth devices found. Exiting...\n')
                sys.exit(0)
            print('Available Bluetooth devices:')
            i = 1
            for device in discovered_devices:
                print('%d) %s: [%s]' %
                      (i, device.get_name(), device.get_tag()))
                i += 1

            # Selecting a device.
            while True:
                choice = int(
                    input("\nSelect a device to connect to (\'0\' to quit): "))
                if choice >= 0 and choice <= len(discovered_devices):
                    break
            if choice == 0:
                # Exiting.
                manager.remove_listener(manager_listener)
                print('Exiting...\n')
                sys.exit(0)
            device = discovered_devices[choice - 1]
            node_listener = MyNodeListener()
            device.add_listener(node_listener)

            # Connecting to the device.
            print('Connecting to %s...' % (device.get_name()))
            if not device.connect():
                print('Connection failed.\n')
                continue

            while True:
                # Getting features.
                features = device.get_features()
                print('\nFeatures:')
                i = 1
                for feature in features:
                    print('%d) %s' % (i, feature.get_name()))
                    i += 1

                # Selecting a feature.
                while True:
                    choice = int(input('\nSelect a feature '
                                       '(\'0\' to disconnect): '))
                    if choice >= 0 and choice <= len(features):
                        break
                if choice == 0:
                    # Disconnecting from the device.
                    print('\nDisconnecting from %s...' % (device.get_name()))
                    if not device.disconnect():
                        print('Disconnection failed.\n')
                        continue
                    device.remove_listener(node_listener)
                    # Resetting discovery.
                    manager.reset_discovery()
                    # Going back to the list of devices.
                    break
                feature = features[choice - 1]

                # Enabling notifications.
                feature_listener = MyFeatureListener()
                feature.add_listener(feature_listener)
                device.enable_notifications(feature)

                # Getting notifications.
                notifications = 0
                while notifications < NOTIFICATIONS:
                    if device.wait_for_notifications(0.05):
                        notifications += 1

                # Disabling notifications.
                device.disable_notifications(feature)
                feature.remove_listener(feature_listener)

    except KeyboardInterrupt:
        try:
            # Exiting.
            print('\nExiting...\n')
            sys.exit(0)
        except SystemExit:
            os._exit(0)


if __name__ == "__main__":

    main(sys.argv[1:])
