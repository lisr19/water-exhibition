import { fetch, post } from '../http'

// 水资源项目下拉列表
export function getProList (params) {
	return fetch('data/project_ids', params)
}
// 水资源节点下拉列表
export function getNodeList (params) {
    return fetch('data/node_ids', params)
}
// 数据统计
export function getCount (params) {
	return fetch('data/count', params)
}

// 水质监测数据
export function getResouData (params) {
	return fetch('data/resources_node', params)
}
// 水环境数据
export function getEnvironment (params) {
	return fetch('data/environment_node', params)
}

// 视频监控
export function getVideo (params) {
	return fetch('data/video_data', params)
}
// 监测设备
export function getDevive (params) {
	return fetch('data/device_data', params)
}

// 地图数据
export function getMapData (params) {
	return fetch('data/map_data', params)
}
// 水资源近7天数据
export function getSevenData (params) {
	return fetch('data/node_seven_data', params)
}

// 水资源通知
export function getMsg (params) {
	return fetch('data/predict_msg', params)
}

// 根据节点id获取监测数据
export function getNodeInfor (params) {
	return fetch('data/node_data', params)
}







