import React, { useState } from "react";
import { Link, useHistory } from "react-router-dom";
import { DatePicker, Input, Select, Space, Table } from "antd";
import { format } from "date-fns";

import "./LocationLogs.css";

import { useLocationLogs } from "../../api/location-logs";
import { useLocations } from "../../api/locations";
import Header from "../../components/Header/Header";
import Sidebar from "../../components/Sidebar/Sidebar";
import Location from "../../types/Location";
import User from "../../types/User";

const { RangePicker } = DatePicker;
const { Search } = Input;
const { Option } = Select;

const columns = [
  {
    title: "시간",
    dataIndex: "createdAt",
    key: "timestamp",
    width: "20%",
    render: (createdAt: string) =>
      format(new Date(createdAt), "yyyy-MM-dd HH:mm"),
  },
  {
    title: "인원",
    dataIndex: "user",
    key: "user",
    render: (user: User) => (
      <Link to={`/user/${user._id}`}>{`${user.rank} ${user.name}`}</Link>
    ),
  },
  {
    title: "장소",
    dataIndex: "location",
    key: "location",
    render: (location: Location) => (
      <Link to={`/location/${location._id}`}>{`${location.name}`}</Link>
    ),
  },
];

const LocationLogs = () => {
  const history = useHistory();
  const [range, setRange] = useState<string[]>();
  const [userName, setUserName] = useState<string>();
  const [location, setLocation] = useState<string>();
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const { data: locations, isLoading: locationLoading } = useLocations();
  const { data: locationLogs } = useLocationLogs({
    rangeStart: range && new Date(range[0]),
    rangeEnd: range && new Date(range[1]),
    offset: (page - 1) * pageSize,
    limit: pageSize,
    location: location === "" ? undefined : location,
  });

  return (
    <div
      style={{
        backgroundColor: "#f2f3f5",
      }}
    >
      <Header></Header>
      <div id="search_engine">
        <div className="engine_headline">
          <img
            src="./icons/backspace_arrow.svg"
            alt=""
            onClick={() => history.goBack()}
          />
          <div>유동병력 검색</div>
          <div style={{ flex: 1 }} />
          <Space>
            <RangePicker
              placeholder={["시작 시간", "종료 시간"]}
              showTime={{ format: "HH:mm" }}
              format="yyyy-MM-DD HH:mm"
              onChange={(_, r) => setRange(r)}
            />
            <Search
              placeholder="사용자 이름"
              onChange={(e) => setUserName(e.target.value)}
            />
            <Select
              placeholder="위치"
              onChange={(value: string) => setLocation(value)}
              loading={locationLoading}
              style={{ width: 200 }}
            >
              <Option value="">전체위치</Option>
              {locations?.map((l) => (
                <Option value={l._id}>{l.name}</Option>
              ))}
            </Select>
          </Space>
        </div>
        <div className="engine_container">
          <Table
            dataSource={locationLogs}
            columns={columns}
            onChange={(pagination) => {
              setPage(pagination.current || 1);
              setPageSize(pagination.pageSize || 10);
            }}
            style={{ flex: 1 }}
          />
        </div>
      </div>
      <Sidebar></Sidebar>
    </div>
  );
};

export default LocationLogs;
