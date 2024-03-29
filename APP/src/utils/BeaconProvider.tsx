import React, { useEffect, useState } from 'react';
import { DeviceEventEmitter, Platform } from 'react-native';
import Beacons from 'react-native-beacons-manager';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRecoilValueLoadable, useSetRecoilState } from 'recoil';

import { useBeacons } from '@/api/beacons';
import { useActiveLocationLog } from '@/api/location-logs';
import { accessTokenState, beaconState, settingsState } from '@/atoms';
import usePermissions from '@/hooks/usePermissions';
import AppSettings from '@/types/AppSettings';

type BeaconProviderProps = {
  children: React.ReactNode;
};

const BeaconProvider = ({ children }: BeaconProviderProps) => {
  const { data: beacons } = useBeacons();
  const { data: locationLog } = useActiveLocationLog();
  const { fullyGranted } = usePermissions();
  const settingsLoadable = useRecoilValueLoadable(settingsState);
  const setVisibleBeacons = useSetRecoilState(beaconState);
  const [backgroundScan, setBackgroundScan] = useState(true);

  useEffect(() => {
    if (!beacons || !fullyGranted) {
      return;
    }
    if (Platform.OS === 'android') {
      Beacons.detectIBeacons();
    }
    Promise.all(
      beacons.map(async beacon => {
        await Beacons.startMonitoringForRegion(beacon.region);
        await Beacons.startRangingBeaconsInRegion(beacon.region);
      }),
    );
    if (Platform.OS === 'ios') {
      Beacons.startUpdatingLocation();
      Beacons.shouldDropEmptyRanges(true);
    }
    const subscriptions = [
      DeviceEventEmitter.addListener('regionDidExit', ({ identifier }) => {
        const beacon = beacons.find(
          value => value.region.identifier === identifier,
        );
        if (beacon) {
          setVisibleBeacons(prevBeacons => {
            const newBeacons = [...prevBeacons];
            const i = newBeacons.findIndex(
              b => b.region.identifier === identifier,
            );
            if (i !== -1) {
              newBeacons.splice(i, 1);
            }
            return newBeacons;
          });
        }
      }),
      DeviceEventEmitter.addListener(
        'beaconsDidRange',
        ({ region: { identifier }, beacons: regions }) => {
          const beacon = beacons.find(b => b.region.identifier === identifier);
          if (beacon) {
            regions.forEach(({ distance }: typeof beacon.region) => {
              setVisibleBeacons(prevBeacons => {
                const newBeacons = [...prevBeacons];
                const newBeacon = { ...beacon };
                newBeacon.region.distance = distance;
                const i = newBeacons.findIndex(
                  b => b.region.identifier === identifier,
                );
                if (i !== -1) {
                  newBeacons[i] = newBeacon;
                } else {
                  newBeacons.push(newBeacon);
                }
                return newBeacons;
              });
            });
          }
        },
      ),
    ];
    return () => {
      Beacons.cleanUpRegions();
      if (Platform.OS === 'ios') {
        Beacons.stopUpdatingLocation();
      }
      subscriptions.forEach(subscription => subscription.remove());
    };
  }, [backgroundScan, beacons, fullyGranted, setVisibleBeacons]);

  useEffect(() => {
    async function toggleBackgroundScan() {
      const { state, contents } = settingsLoadable;
      if (state !== 'loading') {
        const { backgroundScanEnabled } = contents as AppSettings;

        await Beacons.cleanUpRegions();

        if (Platform.OS === 'android') {
          if (backgroundScanEnabled) {
            Beacons.setBackgroundBetweenScanPeriod(1000 * 60 * 5);
            Beacons.setBackgroundScanPeriod(1000 * 10);
            Beacons.enableForegroundServiceScanning({
              activity: 'io.dimitiger.loca.SplashActivity',
              icon: 'ic_noti',
              title: '비콘 스캔중입니다.',
              channelId: 'loca-beacon-scanning',
              channelName: 'LOCA 백그라운드 비콘 스캔 알림',
            });
          } else {
            Beacons.disableForegroundServiceScanning();
          }
        } else {
          Beacons.allowsBackgroundLocationUpdates(backgroundScanEnabled);
        }
        setBackgroundScan(backgroundScanEnabled);
      }
    }
    toggleBackgroundScan();
  }, [settingsLoadable]);

  useEffect(() => {
    if (!beacons) {
      return;
    }
    AsyncStorage.setItem('beacons', JSON.stringify(beacons));
  }, [beacons]);

  useEffect(() => {
    if (!locationLog) {
      return;
    }
    AsyncStorage.setItem('currentLocation', locationLog.location._id);
  }, [locationLog]);

  return <>{children}</>;
};

export default function BeaconProviderWrapper({
  children,
}: BeaconProviderProps) {
  const { state, contents } = useRecoilValueLoadable(accessTokenState);
  return (
    <>
      {state !== 'loading' && !!contents ? (
        <BeaconProvider>{children}</BeaconProvider>
      ) : (
        children
      )}
    </>
  );
}
