import React from 'react';
import { Link, useHistory } from 'react-router-dom';
import { Button, DatePicker, Form, Input, Select, Table } from 'antd';
import { format } from 'date-fns';
import styled from 'styled-components';
import {
  DateParam,
  NumberParam,
  StringParam,
  useQueryParams,
} from 'use-query-params';

import { useLocationLogs } from '../../api/location-logs';
import { useLocations } from '../../api/locations';
import Header from '../../components/Header/Header';
import LargeCard from '../../components/LargeCard';
import LayoutContent from '../../components/LayoutContent';
import LayoutContentWrapper from '../../components/LayoutContentWrapper';
import Sidebar from '../../components/Sidebar/Sidebar';
import Location from '../../types/Location';
import User from '../../types/User';

const { RangePicker } = DatePicker;
const { Search } = Input;
const { Option } = Select;

const columns = [
  {
    title: '시간',
    dataIndex: 'createdAt',
    key: 'timestamp',
    width: '20%',
    render: (createdAt: string) =>
      format(new Date(createdAt), 'yyyy-MM-dd HH:mm'),
  },
  {
    title: '인원',
    dataIndex: 'user',
    key: 'user',
    render: (user: User) => (
      <Link to={`/user/${user._id}`}>{`${user.rank} ${user.name}`}</Link>
    ),
  },
  {
    title: '장소',
    dataIndex: 'location',
    key: 'location',
    render: (location: Location) => (
      <Link to={`/location/${location._id}`}>{`${location.name}`}</Link>
    ),
  },
];

const LocationLogs = () => {
  const history = useHistory();
  const [query, setQuery] = useQueryParams({
    rangeStart: DateParam,
    rangeEnd: DateParam,
    page: NumberParam,
    limit: NumberParam,
    location: StringParam,
  });
  const [form] = Form.useForm();
  const { data: locations, isLoading: locationLoading } = useLocations();
  const { data: locationLogs, pagination } = useLocationLogs({
    rangeStart: query.rangeStart || undefined,
    rangeEnd: query.rangeEnd || undefined,
    location: query.location || undefined,
    page: query.page || undefined,
    limit: query.limit || undefined,
  });

  return (
    <LayoutContentWrapper>
      <Header />
      <LayoutContent>
        <LargeCard
          title="유동병력 검색"
          history={history}
          headerComponent={
            <ToolkitWrap>
              <Form
                form={form}
                onFinish={({ range, userName, location, page, limit }) => {
                  const [rangeStart, rangeEnd] = range || [];
                  setQuery(
                    {
                      rangeStart: rangeStart?.toDate?.(),
                      rangeEnd: rangeEnd?.toDate?.(),
                      location,
                      page,
                      limit,
                    },
                    'replaceIn',
                  );
                }}
                layout="inline">
                <Form.Item name="range">
                  <RangePicker
                    placeholder={['시작 시간', '종료 시간']}
                    showTime={{ format: 'HH:mm' }}
                    format="yyyy-MM-DD HH:mm"
                  />
                </Form.Item>
                <Form.Item name="userName">
                  <Search placeholder="사용자 이름" />
                </Form.Item>
                <Form.Item name="location">
                  <Select
                    placeholder="위치"
                    loading={locationLoading}
                    style={{ width: 200 }}>
                    <Option value="">전체위치</Option>
                    {locations?.map(l => (
                      <Option value={l._id}>{l.name}</Option>
                    ))}
                  </Select>
                </Form.Item>
                <Button type="primary" htmlType="submit">
                  검색
                </Button>
              </Form>
            </ToolkitWrap>
          }>
          <Table
            dataSource={locationLogs}
            rowKey={record => record._id}
            columns={columns}
            pagination={{
              total: pagination?.totalDocs,
              pageSize: pagination?.limit,
              current: pagination?.page,
              showTotal: total => `총 ${total}개`,
              onChange: (page, limit) => setQuery({ page, limit }, 'replaceIn'),
            }}
            style={{ flex: 1, overflow: 'hidden' }}
          />
        </LargeCard>
      </LayoutContent>
      <Sidebar />
    </LayoutContentWrapper>
  );
};

const ToolkitWrap = styled.div`
  display: flex;
  justify-content: space-between;
  flex-wrap: wrap;
`;

export default LocationLogs;