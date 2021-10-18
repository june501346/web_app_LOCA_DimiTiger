import React from 'react';
import { Link, useHistory } from 'react-router-dom';
import { Button, DatePicker, Form, Select, Table } from 'antd';
import { format } from 'date-fns';
import styled from 'styled-components';
import {
  BooleanParam,
  DateParam,
  NumberParam,
  StringParam,
  useQueryParams,
} from 'use-query-params';

import { useEmergencyReports } from '@/api/emergencies';
import Header from '@/components/Header/Header';
import LargeCard from '@/components/LargeCard';
import LayoutContent from '@/components/LayoutContent';
import LayoutContentWrapper from '@/components/LayoutContentWrapper';
import Sidebar from '@/components/Sidebar/Sidebar';
import UserSearchSelect from '@/components/UserSearchSelect';
import User from '@/types/User';

const { RangePicker } = DatePicker;
const { Option } = Select;

const EmergencyReports = () => {
  const history = useHistory();
  const [query, setQuery] = useQueryParams({
    rangeStart: DateParam,
    rangeEnd: DateParam,
    page: NumberParam,
    limit: NumberParam,
    user: StringParam,
    active: BooleanParam,
  });
  const [form] = Form.useForm();
  const { data: locationLogs, pagination } = useEmergencyReports({
    rangeStart: query.rangeStart || undefined,
    rangeEnd: query.rangeEnd || undefined,
    user: query.user || undefined,
    active: query.active || undefined,
    page: query.page || undefined,
    limit: query.limit || undefined,
  });

  return (
    <LayoutContentWrapper>
      <Header />
      <LayoutContent>
        <LargeCard
          title="긴급 신고 현황"
          history={history}
          headerComponent={
            <ToolkitWrap>
              <Form
                form={form}
                initialValues={{
                  user: query.user,
                  range: [query.rangeStart, query.rangeEnd],
                }}
                onFinish={({ range, user, active }) => {
                  const [rangeStart, rangeEnd] = range || [];
                  setQuery(
                    {
                      rangeStart: rangeStart?.toDate?.(),
                      rangeEnd: rangeEnd?.toDate?.(),
                      user: user || undefined,
                      active,
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
                <Form.Item name="user">
                  <UserSearchSelect />
                </Form.Item>
                <Form.Item name="active">
                  <Select placeholder="상태" style={{ width: 200 }}>
                    <Option value="">전체</Option>
                    <Option value="true">진행중</Option>
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
            columns={[
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
                dataIndex: 'creator',
                key: 'user',
                render: (user: User) => (
                  <Link
                    to={`/users/${user._id}`}>{`${user.rank} ${user.name}`}</Link>
                ),
              },
              {
                title: '상태',
                dataIndex: 'active',
                key: 'active',
                render: (active: boolean) => (active ? '진행중' : '완료'),
              },
            ]}
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

export default EmergencyReports;