import Vue from 'vue'
import App from './App.vue'
import router from './router'
import store from './store'
import './common/less/reset.less'
import 'swiper/dist/css/swiper.css'
import 'lib-flexible'
import iView from 'iview'
import 'iview/dist/styles/iview.css';
import VueAwesomeSwiper from 'vue-awesome-swiper'
import echarts from 'echarts'
import VueAMap from 'vue-amap';
VueAMap.initAMapApiLoader({
	key: 'e88c61631a1af9cb57ef3132365b87a9',
	plugin: ['AMap.Autocomplete', 'AMap.PlaceSearch', 'AMap.Scale', 'AMap.OverView', 'AMap.ToolBar', 'AMap.MapType', 'AMap.PolyEditor', 'AMap.CircleEditor','AMap.ControlBar','AMap.MouseTool','AMap.GeometryUtil','AMap.DistrictSearch'],
	// 默认高德 sdk 版本为 1.4.4
	v: '1.4.4',
	uiVersion:'1.0.11',
});
Vue.prototype.$echarts = echarts
Vue.config.productionTip = false
Vue.use(VueAwesomeSwiper)
Vue.use(iView)
Vue.use(VueAMap);


Vue.directive('drag',{
		bind (el, binding) {
			let odiv = el
			odiv.onmousedown = (e)=>{
				let disx = e.clientX - odiv.offsetLeft;
				let disy = e.clientY - odiv.offsetTop;
				document.onmousemove =  (e)=>{
					odiv.style.left = e.pageX - disx+'px';
					odiv.style.top = e.pageY - disy+'px';
				}
				document.onmouseup = (e)=>{
					document.onmousemove = document.onmouseup = null;
				}
			}
		}
})
new Vue({
  router,
  store,
  render: h => h(App)
}).$mount('#app')


