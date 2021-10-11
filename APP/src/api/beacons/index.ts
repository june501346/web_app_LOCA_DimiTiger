<<<<<<< HEAD
import { useQuery } from 'react-query';

import client from '../client';

import Beacon from '@/types/Beacon';

async function getBeacons(): Promise<Beacon[]> {
  const { data } = await client.get('/beacons');
  return data;
}

async function getBeacon(beacon: string): Promise<Beacon> {
  const { data } = await client.get(`/beacons/${beacon}`);
  return data;
}

export function useBeacons() {
  const { data, isLoading } = useQuery(['beacons'], () => getBeacons());

  return {
    beacons: data,
    isLoading,
  };
}

export function useBeacon(beacon: string) {
  const { data, isLoading } = useQuery(['beacons', beacon], () =>
    getBeacon(beacon),
  );

  return {
    beacon: data,
    isLoading,
  };
=======
import { useRecoilValueLoadable } from 'recoil';

import { accessTokenState } from '@/atoms';
import usePaginationQuery from '@/hooks/usePaginationQuery';
import Beacon from '@/types/Beacon';
import PaginationQuery from '@/types/PaginationQuery';

export function useBeacons() {
  const { state, contents } = useRecoilValueLoadable(accessTokenState);
  const query: PaginationQuery = {
    limit: 0,
  };
  return usePaginationQuery<Beacon>('/beacons', query, {
    enabled: state === 'hasValue' && !!contents,
  });
>>>>>>> ea2fd2bc8e50c20f9062a8bb0168195300911070
}
