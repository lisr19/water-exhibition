import Vue from 'vue'
import VueRouter from 'vue-router'
import Home from '../views/Home.vue'
import Map from '../views/map.vue'

Vue.use(VueRouter)

const routes = [
  {
    path: '/',
    name: 'Home',
    component: Home
  },
  {
    path: '/map',
    name: 'map',
    component: Map

  },
	{
		path: '/map2',
		name: 'map2',
		component: () => import(/* webpackChunkName: "about" */ '../views/map2.vue')
	},
	{
		path: '/swiper',
		name: 'swiper',
		component: () => import(/* webpackChunkName: "about" */ '../views/swiper.vue')
	}
]

const router = new VueRouter({
  routes
})

export default router
