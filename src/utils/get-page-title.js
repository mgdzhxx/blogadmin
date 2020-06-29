/*
 * @Author: zhxx
 * @Date: 2020-06-29 09:52:28
 * @LastEditors: zhxx
 * @LastEditTime: 2020-06-29 10:06:26
 */
import defaultSettings from '@/settings'

const title = defaultSettings.title || '矿场管理控制台'

export default function getPageTitle(pageTitle) {
  if (pageTitle) {
    return `${pageTitle} - ${title}`
  }
  return `${title}`
}
