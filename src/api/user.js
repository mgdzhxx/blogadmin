/*
 * @Author: zhxx
 * @Date: 2020-06-29 09:52:28
 * @LastEditors: zhxx
 * @LastEditTime: 2020-06-29 10:24:28
 */
import request from '@/utils/request'

export function login(data) {
  return request({
    url: '/admin/login',
    method: 'post',
    data
  })
}

export function getInfo() {
  return request({
    url: '/admin/users/info',
    method: 'get'
  })
}

export function logout() {
  return request({
    url: '/admin/users/logout',
    method: 'put'
  })
}

// 获取用户登录记录
export function getUserOauthInfo(query) {
  return request({
    url: '/admin/users/logs',
    method: 'get',
    params: query
  })
}

