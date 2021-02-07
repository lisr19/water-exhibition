// import {userLogin} from "../../lib/API/comment";
export default {
	state: {
		WaterInfo:{}
	},
	mutations:{
		setWaterInfo(state, WaterInfo) {
			state.WaterInfo = WaterInfo
		},
	},
	getters: {},
	actions: {
		setWaterInfo(context, data) { context.commit('setWaterInfo', data) },
	}
}
