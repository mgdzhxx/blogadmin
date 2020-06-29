/*
 * @Author: zhxx
 * @Date: 2020-06-29 11:19:27
 * @LastEditors: zhxx
 * @LastEditTime: 2020-06-29 16:26:39
 */
import request from '@/utils/request'

// 获取所有矿场客户端列表
export function getMineList(query) {
  return request({
    url: '/admin/user/mine/list',
    method: 'get',
    params: query
  })
}

// 更新矿场客户端信息
export function updateMineInfo(data) {
  return request({
    url: '/admin/user/mine/update',
    method: 'put',
    data
  })
}

// 获取矿机列表
export function GetMachineList(query) {
  return request({
    url: '/admin/user/machine/list',
    method: 'get',
    params: query
  })
}
// 获取挖矿详情信息
export function GetMachineStatus(query) {
  return request({
    url: '/admin/user/machine/info',
    method: 'get',
    params: query
  })
}

// 添加一个机器
export function AddMachines(data) {
  return request({
    url: '/admin/user/machine/add',
    method: 'post',
    data
  })
}
// 删除一个机器
export function DelMachines(data) {
  return request({
    url: '/admin/user/machine/del',
    method: 'put',
    data
  })
}
// 获取订单列表
export function GetOrderList(query) {
  return request({
    url: '/admin/user/order/list',
    method: 'get',
    params: query
  })
}
// 获取任务列表
export function GetTaskList(query) {
  return request({
    url: '/admin/user/task/list',
    method: 'get',
    params: query
  })
}
