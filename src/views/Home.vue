<template>
	<div class="page">
		<div class="head">
			<div class="tip">
				<!--<div class="item">-->
					<!--<p class="name">项目</p>-->
					<!--<p class="count">{{countData.project_count}}</p>-->
				<!--</div>-->
				<div class="item">
					<p class="name">节点</p>
					<p class="count">{{countData.node_count}}</p>
				</div>
				<div class="item">
					<p class="name">监测设备</p>
					<p class="count">{{countData.device_count}}</p>
				</div>
				<div class="item">
					<p class="name">视频设备</p>
					<p class="count">{{countData.video_count}}</p>
				</div>
			</div>
			<div class="title">

				<!--<p class="c-title">水资源和水环境保护智能监测系统</p>-->
				<!--<p class="e-title">Intelligent monitoring system for water resources and water environment protection</p>-->
			</div>
			<div class="tip" style="justify-content:space-evenly">
				<!--<div class="item">-->
					<!--<p class="name">视频设备</p>-->
					<!--<p class="count">{{countData.video_count}}</p>-->
				<!--</div>-->
				<div class="item">
					<p class="name">通讯故障</p>
					<p class="count">{{countData.unlink_count}}</p>
				</div>
				<div class="item">
					<p class="name">设备故障</p>
					<p class="count">{{countData.breakdown_count}}</p>
				</div>
			</div>
			<div class="time"> {{currentTime|filterTime}}</div>
		</div>

		<div class="content">
			<div class="left">
				<div class=" wrap-box box-one"  @mouseenter="mouseEnter" @mouseleave="mouseLeave">
					<h3><em></em>水质监测数据</h3>
					<swiper v-if="resourcesData.length>0" :options="swiperOption"  ref="mySwiper"  class="swiper-wrapper swiper-no-swiping">
						<swiper-slide   v-for="item in resourcesData" :key="item.id">
							<div class="item">
								<p class="title">{{item.name}} <span class="time">{{item.date}}</span></p>
								<div class="infor" v-if="item.device_have===1">
									<span v-if="item.temperature">温度：<strong :class="item.temperature_status===1?'yellow':(item.temperature_status===2?'red':'')">{{item.temperature}}<em>℃</em></strong></span>
									<span v-if="item.chrominance">色度：<strong :class="item.chrominance_status===1?'yellow':(item.chrominance_status===2?'red':'')">{{item.chrominance}}<em>℃</em></strong></span>
									<span v-if="item.turbidity">浊度：<strong :class="item.turbidity_status===1?'yellow':(item.turbidity_status===2?'red':'')">{{item.turbidity}}<em>NTU</em></strong></span>
									<span v-if="item.PH">PH：<strong :class="item.PH_status===1?'yellow':(item.PH_status===2?'red':'')">{{item.PH}}<em></em></strong></span>
									<span v-if="item.COD">化学需氧量：<strong :class="item.COD_status===1?'yellow':(item.COD_status===2?'red':'')">{{item.COD}} <em>mg/L</em></strong></span>
									<span v-if="item.TOC">有机含碳量：<strong :class="item.TOC_status===1?'yellow':(item.TOC_status===2?'red':'')">{{item.TOC}}<em>mg/L</em></strong></span>
									<span v-if="item.EC">电导率：<strong :class="item.EC_status===1?'yellow':(item.EC_status===2?'red':'')">{{item.EC}}<em>mS/cm</em></strong></span>
									<span v-if="item.suspended">漂浮物：<strong :class="item.suspended_status===1?'yellow':(item.suspended_status===2?'red':'')">{{item.suspended}}<em>mg/L</em></strong></span>
									<span v-if="item.dissolved_oxygen">溶解氧：<strong :class="item.dissolved_oxygen_status===1?'yellow':(item.dissolved_oxygen_status===2?'red':'')">{{item.dissolved_oxygen}}<em>mg/L</em></strong></span>
									<span v-if="item.cadmium_ion">铬离子：<strong :class="item.cadmium_ion_status===1?'yellow':(item.cadmium_ion_status===2?'red':'')">{{item.cadmium_ion}}<em>ppm</em></strong></span>
									<span v-if="item.cryanide_ion">氰离子：<strong :class="item.cryanide_ion_status===1?'yellow':(item.cryanide_ion_status===2?'red':'')">{{item.cryanide_ion}}<em>ppm</em></strong></span>
									<span v-if="item.lead_ion">铅离子：<strong :class="item.lead_ion_status===1?'yellow':(item.lead_ion_ion_status===2?'red':'')">{{item.lead_ion}}<em>ppm</em></strong></span>
									<span v-if="item.chlorophyll">叶绿素：<strong :class="item.chlorophyll_status===1?'yellow':(item.chlorophyll_status===2?'red':'')">{{item.chlorophyll}}<em>ug/L</em></strong></span>
								</div>
								<div class="null-tip" v-else style="margin-top: 20px">暂无数据</div>
								<img class="dingwei" src="@/assets/icons/dingwei.png" alt=""  @click="openLocat(item)">
							</div>
						</swiper-slide>
					</swiper>
					<div class="loading loading1" v-if="loading1">
						<Spin size="large">
							<Icon type="ios-loading" size=50 class="demo-spin-icon-load"></Icon>
							<div>Loading</div>
						</Spin>
					</div>
				</div>
				<div class=" wrap-box box-two">
					<h3><em></em>水环境数据</h3>
					<swiper v-if="environmentList.length>0" :options="swiperOption2"  ref="mySwiper2" class="swiper-wrapper swiper-no-swiping" >
						<swiper-slide v-for="(item,index) in environmentList" :key="index">
							<div class="item">
								<p class="title">{{item.name}} <span class="time">{{item.date}}</span></p>
								<!--<p class="title">{{item.id}} </p>-->
								<div class="cont" v-if="item.device_have===1">
									<div :class="item.level_status===2?'red':''" class="item-detail">
										<div class="icon-wrap">
											<img v-if="item.level_status===2" src="@/assets/img/shuiwei2.png" alt="" >
											<img v-else src="@/assets/img/shuiwei.png" alt="" >
											水位
										</div>
										<span :class="item.level_status===1?'yellow':''">{{item.level}}M</span>
									</div>
									<div  class="item-detail" :class="item.speed_status===2?'red':''">
										<div class="icon-wrap">
											<img v-if="item.speed_status===2" src="@/assets/img/liuliang2.png" alt="" >
											<img v-else src="@/assets/img/liuliang.png" alt="" >
											流量
										</div>
										<span :class="item.speed_status===1?'yellow':''">{{item.speed}}m³/s</span>
									</div>
									<div  class="item-detail" :class="item.rainfall_status===2?'red':''">
										<div class="icon-wrap" >
											<img style="width: 12px" v-if="item.rainfall_status===2"  src="@/assets/img/yuliang2.png" alt="" >
											<img style="width: 12px" v-else src="@/assets/img/yuliang.png" alt="" >
											雨量
										</div>
										<span :class="item.rainfall_status===1?'yellow':''">{{item.rainfall}}mm</span>
									</div>
								</div>
								<div class="null-tip" v-else style="margin-top: 15px">暂无数据</div>
							</div>
						</swiper-slide>
					</swiper>
					<div class="loading loading2" v-if="loading2">
						<Spin size="large">
							<Icon type="ios-loading" size=38 class="demo-spin-icon-load"></Icon>
							<div>Loading</div>
						</Spin>
					</div>
				</div>
			</div>
			<div class="center">
				<div class="map-wrap">
					<div class="map-title">
						<!--<div>项目：-->
							<!--<Select v-model="projectId" style="width:150px" @on-change="onChange">-->
								<!--<Option  v-for="item in projectList" :value="item.id" :key="item.id">{{ item.name }}</Option>-->
							<!--</Select>-->
						<!--</div>-->
						<div>
							节点：<Select v-model="nodeId" style="width:200px" label-in-value>
							<Option v-for="item in nodeList" :value="item.id" :key="item.id"  @click.native="onChangeNode(item)" >{{ item.name }}</Option>
						</Select>
						</div>
						<!--<div>-->
							<!--区域：<Select v-model="projectId" style="width:150px">-->
							<!--<Option v-for="item in projectList" :value="item.value" :key="item.value">{{ item.label }}</Option>-->
							<!--</Select>-->
						<!--</div>-->
					</div>
					<Dropdown  class="map-select" trigger="click" placement="top" @on-click="selectBtn">
						<a class="btn" href="javascript:void(0)" style="width: auto">
							<template>
								<img src="@/assets/icons/all.png" alt="" v-if="selectType==='全部'">
								<img src="@/assets/icons/icon1.png" alt="" v-if="selectType==='摄像头'">
								<img src="@/assets/icons/icon2.png" alt="" v-if="selectType==='水环境监测'">
								<img src="@/assets/icons/icon3.png" alt="" v-if="selectType==='水质检测'">
							</template>
							{{selectType}}
							<Icon type="ios-arrow-down"></Icon>
						</a>
						<DropdownMenu slot="list" >
							<DropdownItem class="btn" name="全部" ><img src="@/assets/icons/all.png" alt="">全部</DropdownItem>
							<DropdownItem class="btn" name="摄像头" ><img src="@/assets/icons/icon1.png" alt="">摄像头</DropdownItem>
							<DropdownItem class="btn"  name="水质检测"  ><img src="@/assets/icons/icon3.png" alt="">水质检测</DropdownItem>
							<DropdownItem class="btn" name="水环境监测"  ><img src="@/assets/icons/icon2.png" alt="">水环境监测</DropdownItem>
						</DropdownMenu>
					</Dropdown>
					<div class="map">
						<my-map :projectId="projectId" :selectType="selectType" :szItem="szItem" :currCenter="currCenter"></my-map>
					</div>

				</div>
				<div class="chart wrap-box">
					<h3 class="title">
						<em></em>水资源监测周趋势<span class="node">{{sevenData.node_name}}（{{sevenData.project_name}}）</span>
						<marquee  class="tip" align=middle scrollamount=5>
							<div style="display: flex;align-items: center" v-for="item in msgList">
								<img src="@/assets/img/tongzhi.png" alt="" style="width: 22px;margin-right: 2px">
								<span>{{item}}</span>
							</div>
							<div v-if="msgList.length===0">暂无通知</div>
						</marquee>
					</h3>
					<swiperWater :sevenData="sevenData"></swiperWater>
				</div>
			</div>
			<div class="right">
				<div class=" wrap-box box-one">
					<h3><em></em>视频监控</h3>
					<swiper v-if="videoList.length>0" :options="swiperOption3"  ref="mySwiper3"  class="swiper-wrapper">
						<swiper-slide v-for="item in videoList" :key="item.id">
							<div class="item" @click="openVideo(item)">
								<template>
									<img v-if="item.img" :src="item.img" alt="">
									<img v-else src="@/assets/img/shexiangtou.png" alt="">
								</template>
								<div style="flex: 1;margin-left: 15px">
									<p class="title">{{item.device_name}}</p>
									<div class="cont" v-if="item.boat_info">
										<p><img  src="@/assets/img/ship.png" alt="" >
											船舶信息：{{item.boat_info||'暂无'}}</p>
										<p :class="isOk?'warn':''"><img  src="@/assets/img/float.png" alt="" >
											漂浮物:{{item.tsp_info||'暂无'}}</p>
									</div>
									<div class="cont" v-else>水面信息：暂无</div>
									<!--{{item.node_id}}-->
								</div>
							</div>
						</swiper-slide>
					</swiper>
					<div class="loading loading3" v-if="loading3">
						<Spin size="large">
							<Icon type="ios-loading" size=48 class="demo-spin-icon-load"></Icon>
							<div>Loading</div>
						</Spin>
					</div>
				</div>
				<div class=" wrap-box box-two">
					<h3><em></em>监测设备</h3>
					<swiper v-if="deviveList.length>0" :options="swiperOption4"  ref="mySwiper4"  class="swiper-wrapper swiper-no-swiping">
						<swiper-slide v-for="item in deviveList" :key="item.id" class="swiper-slide">
							<div class="item" :class="item.device_status===0?'fault':''">
								<template v-if="item.device_type_id===1" >
									<img v-if="item.device_status===0" src="@/assets/img/jiankong2.png" alt="" >
									<img v-else src="@/assets/img/jiankong1.png" alt="" >
								</template>
								<template  v-else>
									<img v-if="item.device_status===0" src="@/assets/img/yongshui2.png" alt="" >
									<img v-else src="@/assets/img/yongshui.png" alt="" >
								</template>
								<img  v-if="item.device_status===0" src="@/assets/img/nowifi.png" alt="" style="position: absolute;top: 10px;right: 20px">
								<div class="cont">
									<p class="name">{{item.device_name}}</p>
									<p class="node">节点：{{item.node_name}}</p>
								</div>
							</div>
						</swiper-slide>
					</swiper>
					<div class="loading loading4" v-if="loading4">
						<Spin size="large">
							<Icon type="ios-loading" size=38 class="demo-spin-icon-load"></Icon>
							<div>Loading</div>
						</Spin>
					</div>
				</div>
			</div>
		</div>
		<!--监控视频弹窗-->
		<div class="mark"  @click.self="showVideo=false" v-if="showVideo">
			<div class="video-wrap" v-drag>
				<iframe id="monitor" :src="iframeUrl" frameborder="0"  ref="mainIframe" name="monitor"></iframe>
				<img class="close-btn" src="@/assets/img/close.png" alt="" @click="showVideo=false">
			</div>
		</div>
	</div>
</template>

<script>
	import myMap from './map'
	import swiperWater from './swiper'
	import {mapState,mapActions} from 'vuex'
	import {getCount,getProList,getNodeList,getResouData,getVideo,getDevive,getSevenData,getMapData,getEnvironment,getMsg} from '@/libs/API/comment'
	export default {
		components: {
			myMap,
			swiperWater,
		},
		data(){
			return{
				loading1:false,
				loading2:false,
				loading3:false,
				loading4:false,
				iframeUrl:process.env.NODE_ENV === 'production' ? 'wm_big_screen/demo/index.html' : 'demo/index.html',
				dataListOne:[],
				// 渲染总数
				total: 0,
				// 当前已经渲染DOM的页数
				countPage:0,
				msgList:[],
				szItem:{},//水质
				shjItem:{},//水环境
				currCenter:[],
				selectType:'全部',
				nodeId:'',
				projectId:'',
				projectList:[],
				iframeData:'',
				modal1:'',
				showVideo:false,
				currentTime: new Date(), // 获取当前时间
				isOk:true,
				swiperOption: {
					direction : 'vertical',
					// slidesPerGroup : 3,
					// notNextTick: true,
					slidesPerView: 'auto',
					autoHeight: true,
					// slidesPerView : 3.5,
					// spaceBetween: 12,
					// autoplay: true,
					observer:true,//修改swiper自己或子元素时，自动初始化swiper
					// observeParents:true,//修改swiper的父元素时，自动初始化swiper
					loop: true,
					speed:15000,//匀速时间
					autoplay: {
						delay: 0,
						stopOnLastSlide: false,
						disableOnInteraction: false,
					},

				},
				swiperOption2: {
					direction : 'vertical',
					slidesPerView: 'auto',
					autoHeight: true,
					// spaceBetween: 10,
					observer: true,
					loop: true,
					speed:2000,//匀速时间
					autoplay: {
						delay: 8000,
						stopOnLastSlide: false,
						disableOnInteraction: false,
					},
				},
				swiperOption3: {
					// slidesPerGroup : 3,
					direction : 'vertical',
					slidesPerView: 'auto',
					autoHeight: true,
					spaceBetween: 10,
					observer: true,
					loop: true,
					speed:1500,//匀速时间
					autoplay: {
						delay: 6000,
						stopOnLastSlide: false,
						disableOnInteraction: false,
					},

				},
				swiperOption4: {
					direction : 'vertical',
					slidesPerView: 'auto',
					autoHeight: true,
					// spaceBetween: 10,
					observer: true,
					loop: true,
					speed:5000,//匀速时间
					autoplay: {
						delay: 0,
						stopOnLastSlide: false,
						disableOnInteraction: false,
					},
				},
				swiperList: [],
				equipmentList:[],//设备列表
				resourcesData:[], //水质监测数据
				countData:{}, //数据统计
				nodeList:[],//节点列表
				videoList:[],//监控视频列表
				deviveList:[],//监测设备列表
				sevenData:[],//7天数据
				mapData:{},
				environmentList:[]
			}
		},
		//计算属性，获得可以操作的swiper对象
		computed: {
			...mapState({
				WaterInfo:state=>state.water.WaterInfo,
			}),
			mySwiper() {
				// mySwiper 是要绑定到标签中的ref属性
				return this.$refs.mySwiper.$swiper
			},
		},
		filters: {
			filterTime(val) {
				let Y = val.getFullYear()
				let M = val.getMonth()+1
				M = M < 10 ? '0' + M : M
				let D = val.getDate()
				D = D < 10 ? ('0' + D) : D
				let H = val.getHours()
				let MI = val.getMinutes()
				// let S = val.getSeconds()
				// return Y + "年" + M + "月" + D + "日" + H + "时" + MI + "分" + S + "秒"
				return Y + "/" + M + "/" + D +' '+  H + "时" + MI + "分"
			}
		},
		mounted() {
			this.projectId =location.href.includes('project_id=')?location.href.split('project_id=')[1].slice(0,this.projectId.length-2):6
			this.getProList()
			setInterval( () =>{
				this.currentTime = new Date()//更新时间
			}, 1000*60)
		},
		methods: {
			loop(currPage,allList,onceCount,type,typeTime) {
				let loopCount = allList.length / onceCount; //渲染次数
				if(currPage>loopCount){
					currPage = 1
				}
				setTimeout(() => {
					const temp1 = [];
					for (let i = 0; i < onceCount; i++) {
						// if(i+currPage*onceCount>allList.length)return
						temp1.push(allList[i+currPage*onceCount])
					}
					const temp = temp1.filter(Boolean)
					currPage++
					console.log(type+currPage);
					if(type==='水质'){
						this.resourcesData = this.resourcesData.concat(temp);
						if(this.resourcesData.length>250){
							this.loading1 =true
							this.resourcesData.splice(0,230);
							setTimeout(()=>{
								this.loading1 =false
							},800)
						}
					}else if(type==='水环境'){
						this.environmentList = this.environmentList.concat(temp);
						if(this.environmentList.length>150){
							this.loading2 =true
							this.environmentList.splice(0,140);
							setTimeout(()=>{
								this.loading2 =false
							},800)
						}
					}else if(type==='视频监控'){
						this.videoList = this.videoList.concat(temp);
						if(this.videoList.length>150){
							this.loading3 =true
							this.videoList.splice(0,140);
							setTimeout(()=>{
								this.loading3 =false
							},800)
						}
						// console.log(this.videoList);
					}else if(type==='设备'){
						this.deviveList = this.deviveList.concat(temp);
						if(this.deviveList.length>150){
							this.loading4 =true
							this.deviveList.splice(0,130);
							setTimeout(()=>{
								this.loading4 =false
							},800)
						}
					}
					this.loop(currPage,allList,onceCount,type,typeTime);
				}, typeTime);
			},
			openLocat(item){
				console.log(item);
				this.szItem = item
			},
			selectBtn(type){
				console.log(type);
				setTimeout(()=>{
					this.selectType=type
				},100)

			},
			//改变项目
			onChange(data){
				this.projectId =data
			},
			onChangeNode(item){
				this.currCenter=item.coordinate
			},
			async getProList(){
				let res = await getProList()
				if (res.errno === 0) {
					let project_id={}
					if(this.projectId){
						project_id ={project_id:this.projectId}
					}else {
						project_id ={project_id:res.data[0].id}
					}
					this.getCount(project_id)
					this.getSevenData(project_id)
					this.getMsg(project_id)
					this.getNodeList(project_id)
					this.getResouData(project_id)
					this.getVideo(project_id)
					this.getDevive(project_id)
					this.getEnvironment(project_id)
				}
			},
			async getResouData(params){
				let res = await getResouData(params)
				if (res.errno === 0) {
					let allList =res.data
					let totol = res.data.length
					this.resourcesData = allList.slice(0,20)
					this.loop(0,allList.slice(20,allList.length),10,'水质',1000*15*10)
					// this.resourcesData = res.data
					// if(this.resourcesData.length<4){
					// 	this.swiperOption.loop=false
					// }
				}
			},
			async getEnvironment(params){
				let res = await getEnvironment(params)
				if (res.errno === 0) {
					let allList =res.data
					this.environmentList = allList.slice(0,10)
					this.loop(0,allList.slice(10,allList.length),10,'水环境',1000*100)
				} else {

				}
			},
			async getMapData(params){
				let res = await getMapData(params)
				if (res.errno === 0) {
					this.mapData = res.data
				} else {
					console.log('获取地图数据失败');
				}
			},
			async getMsg(params){
				let res = await getMsg(params)
				if (res.errno === 0) {
					res.data.map((i)=>{
						this.msgList.push(i.content)
					})
				} else {
					console.log('获取通知失败');
				}
			},

			async getSevenData(params){
				let res = await getSevenData(params)
				if (res.errno === 0) {
					this.sevenData = res.data
				} else {
					console.log('获取7天数据失败');
				}
			},
			async getVideo(params){
				let res = await getVideo(params)
				if (res.errno === 0) {
					let allList =res.data
					this.videoList = allList.slice(0,10)
					this.loop(0,allList.slice(10,allList.length),10,'视频监控',1000*80)
				} else {
					console.log('获取摄像头数据失败');
				}
			},
			async getDevive(params){
				let res = await getDevive(params)
				if (res.errno === 0) {
					let allList =res.data
					this.deviveList = allList.slice(0,20)
					this.loop(0,allList.slice(20,allList.length),10,'设备',1000*50)
					// if(this.deviveList.length<5){
					// 	this.swiperOption4.loop=false
					// }
				} else {

				}
			},
			async getNodeList(params){
				let res = await getNodeList(params)
				if (res.errno === 0) {
					this.nodeId = res.data[0].id ||''
					let allList =res.data
					let i = 0
					this.timer1 = setInterval(() => {
						this.nodeList = this.nodeList.concat(allList.slice(i, i + 50))
						i += 50
						if (i > allList.length) {
							clearInterval(this.timer1)
						}
					}, 1000)
				} else {

				}
			},

			async getCount(params){
				let res = await getCount(params)
				if (res.errno === 0) {
					this.countData = res.data
				} else {

				}
			},
			mouseEnter() {
				this.mySwiper.autoplay.stop()
			},
			mouseLeave() {
				this.mySwiper.autoplay.start()
			},
			init() {
				setTimeout(() => {
					window.onresize = () =>{
						this.$echarts.init(this.$refs.chart1).resize()
					}
				},100)
			},
			fontSize(res){
				let docEl = document.documentElement,
					clientWidth = window.innerWidth||document.documentElement.clientWidth||document.body.clientWidth;
				if (!clientWidth) return;
				let fontSize = 100 * (clientWidth / 1920);
				return res*fontSize;
			},
			openVideo(item){
				this.showVideo = true
				setTimeout(()=>{
					this.setData(item)
				},500)

			},
			setData(data) {
				let mapFrame = this.$refs['mainIframe']
				let iframeWin = mapFrame.contentWindow
				iframeWin.postMessage(data,'*')
			},
		},
		updated() {
		},
	}
</script>

<style lang="less" scoped>
	.page{
		padding: 5px 10px;
		background: url(../assets/img/bg.png) no-repeat;
		background-size: 100% 100%;
		z-index: -1;
		/*position: absolute;*/
		/*width: 100%;*/
		/*height: 100%;*/
		/*overflow: hidden;*/
	}
	.blue{
		color: #CDFFDF!important;
	}
	.green{
		color: #00CE4A!important;
	}
	.red{
		color: #FF2A00!important;
	}
	.yellow{
		color: #FF9700!important;
	}
	.warn{
		color: #FFD1A0!important;
	}
	.fault{
		background: rgba(253, 71, 111, 0.23) !important;
	}
	.head{
		display: flex;
		height: 110px;
		justify-content: space-between;
		background:url("../assets/img/titile.png") no-repeat;
		background-size: 100% 100%;
		.tip{
			display: flex;
			justify-content: space-between;
			align-content: flex-end;
			width: 372px;
			margin: 20px 23px 0;
			.item{
				display: flex;
				flex-direction: column;
				.name{
					font-size: 22px;
					font-family: PingFangSC-Regular, PingFang SC;
					font-weight: 400;
					color: #FFFFFF;
				}
				.count{
					font-size: 47px;
					font-family: LCDUltra;
					color: #FFFFFF;
					/*text-shadow: 0px 2px 3px #101B35;*/
					background: linear-gradient(180deg, #F6FBFF 0%, #9FD7FB 100%);
					-webkit-background-clip: text;
					-webkit-text-fill-color: transparent;
				}
			}
		}
		.title{
			.c-title{
				font-size: 52px;
				font-family: PingFangSC-Regular, PingFang SC;
				font-weight: 400;
				color: #D9E4FF;
				/*text-shadow: 0px 1px 5px #0D2859;*/
				background: linear-gradient(180deg, #EEEEEE 0%, #86DBFF 100%);
				-webkit-background-clip: text;
				-webkit-text-fill-color: transparent;
			}
			.e-title{
				font-size: 15px;
				font-weight: 400;
				color: #8ADCFF;
			}
		}
		.time{
			font-size: 12px;
			font-family: LCDUltra;
			color: #E3F5FF;
			line-height: 13px;
			position: absolute;
			right: 30px;
			top: 6px;
		}
	}
	.content{
		display: flex;
		margin-top: 11px;
		.wrap-box{
			text-align: left;
			h3{
				padding: 0 9px;
				font-size: 18px;
				font-family: PingFangSC-Medium, PingFang SC;
				font-weight: 500;
				color: #C2FFCA;
				display: flex;
				align-items: center;
				line-height: 40px;
				em{
					width: 3px;
					height: 20px;
					background: #C2FFCA;
					display: inline-block;
					margin-right: 9px;
				}

			}
		}
		.left{
			width: 437px;
			.box-one{
				position: relative;
				height: 507px;
				background:url("../assets/img/left1.png") no-repeat;
				background-size: 100% 100%;
				.swiper-wrapper{
					height: 456px;
				}
				.item{
					width: 437px;
					min-height: 121px;
					background: rgba(0, 131, 209, 0.24);
					border-radius: 4px;
					padding: 10px 15px;
					box-sizing: border-box;
					margin-bottom: 5px;
					.title{
						margin-bottom: 9px;
						font-size: 16px;
						.time{
							font-size: 9px;
							margin-left: 6px;
						}
					}
					.dingwei{
						width: 15px;
						position: absolute;
						right: 10px;
						bottom: 10px;
					}
					.infor{
						line-height: 2;
						display: flex;
						flex-wrap: wrap;
						align-items: center;
						font-size: 11px;
						span{
							/*margin-right: 20px;*/
							width: 160px;
							strong{
								font-size: 19px;
								font-weight: 400;
								color: #CDFFDF;
								em{
									font-size: 12px;
								}
							}
						}
						span:nth-child(2n){
							margin-left: 50px;
						}
					}
				}
			}
			.box-two{
				height: 401px;
				background:url("../assets/img/left2.png") no-repeat;
				background-size: 100% 100%;
				margin-top: 8px;
				position: relative;
				.swiper-wrapper{
					height: 356px;
				}
				.item{
					width: 437px;
					min-height: 100px;
					background: rgba(0, 131, 209, 0.24);
					border-radius: 4px;
					padding: 10px 13px;
					box-sizing: border-box;
					margin-bottom: 5px;
					.title{
						margin-bottom: 9px;
						position: relative;
						font-size: 16px;
						.time{
							font-size: 9px;
							position: absolute;
							right: 2px;
							top: 3px;
						}
					}
					.cont{
						line-height: 2.5;
						display: flex;
						flex-wrap: wrap;
						align-items: center;
						font-size: 11px;
						color: #E9E9E9;
						.item-detail{
							margin-right: 50px;
							display: flex;
							font-size: 10px;
							img{
								width: 18px;
							}
							.icon-wrap{
								display: flex;
								align-items: center;
								margin-right: 4px;
								flex-direction: column;
							}
							span{
								font-size: 16px;
								font-weight: 400;
								margin-left: 5px;
							}
						}

					}
				}
			}
		}
		.right{
			width: 437px;
			.box-one{
				height: 544px;
				background:url("../assets/img/right1.png") no-repeat;
				background-size: 100% 100%;
				/*background: rgba(4, 32, 97, 0.64);*/
				box-shadow: 0px 1px 41px 0px rgba(68,181,249,0.5);
				position: relative;
				.swiper-wrapper{
					height: 496px;
				}
				.item{
					width: 437px;
					min-height: 121px;
					background: rgba(0, 131, 209, 0.24);
					/*border-radius: 4px;*/
					padding: 9px;
					box-sizing: border-box;
					margin-bottom:2px;
					display: flex;
					overflow: hidden;
					img{
						width: 113px;
						height: 113px;
						border-radius: 8px;
					}
					.title{
						margin-bottom: 11px;
						font-size: 16px;
						font-weight: 500;
						color: #E8E8E8;
					}
					.cont{
						font-size: 14px;
						font-weight: 400;
						color: #E8E8E8;
						line-height: 2;
						>p{
							display: flex;
							align-items: center;
						}
						img{
							height: 17px;
							width: 15px;
							margin-right: 5px;
						}
						span{
							margin-right: 30px;
							strong{
								font-size: 19px;
								font-weight: 400;
								color: #E9E9E9;
								em{
									font-size: 10px;
								}
							}
						}

					}
				}
			}
			.box-two{
				height: 361px;
				margin-top: 8px;
				background:url("../assets/img/right2.png") no-repeat;
				background-size: 100% 100%;
				position: relative;
				.swiper-wrapper{
					height: 316px;
					.swiper-slide{
						display: flex;
						justify-content: center;
					}
				}
				.item{
					display: flex;
					width: 422px;
					height: 67px;
					background: rgba(0, 131, 209, 0.24);
					border-radius: 4px;
					box-sizing: border-box;
					margin-bottom:5px;
					overflow: hidden;
					align-items: center;
					padding: 0 10px;
					img{
						width: 30px;
					}
					.cont{
						font-size: 18px;
						/*font-weight: 600;*/
						color: #FFFFFF;
						margin-left: 10px;
						.name{
							width: 320px;
							overflow: hidden;
							text-overflow:ellipsis;
							white-space: nowrap;
						}
						.node{
							font-size: 12px;
						}
					}

				}
			}
		}
		.center{
			width: 982px;
			margin:0 15px;
			background: rgba(7, 42, 76, 0.11);
			box-sizing: border-box;
			overflow: hidden;
			.map-wrap{
				height: 670px;
				background: rgba(7, 42, 76, 0.6);
				position: relative;
				.map-title{
					width: 100%;
					padding: 0 20px;
					height: 62px;
					background: rgba(7, 42, 76, 0.6);
					position: absolute;
					top: 0;
					z-index: 999;
					display: flex;
					align-items: center;
					color: #ffffff;
					font-size: 12px;
					box-sizing: border-box;
				}
				.map-select{
					position: absolute;
					min-width: 100px;
					bottom:2px;
					right: 10px;
					height: 50px;
					z-index: 999;
					display: flex;
					align-items: center;
					justify-content: space-around;
					color: #ffffff;
					box-sizing: border-box;
					cursor: pointer;
					/*background: rgba(7, 42, 76, 0.6);*/

					.btn{
						height: 38px;
						line-height: 38px;
						padding: 0 10px;
						color: #ffffff;
						margin: 5px 0;
						background: rgba(0,60,101,0.90);
						font-size: 13px;
						border-radius: 8px;
						display: flex;
						align-items: center;
						justify-content: center;
						img{
							width: 22px;
							margin-right:3px;
						}
					}
				}
				.map{

				}
			}
			.chart{
				margin-top: 8px;
				width: 980px;
				height: 236px;
				background:url("../assets/img/bottom1.png") no-repeat;
				background-size: 100% 100%;
				box-sizing: border-box;
				.title{
					position: relative;
					.node{
						font-size: 12px;
						font-weight: 400;
						color: #FFFFFF;
						margin-left: 10px;
					}
					.tip{
						width: 373px;
						height: 26px;
						background: #051A47;
						box-shadow: 0px 1px 2px 0px rgba(5,7,42,0.5);
						border-radius: 13px;
						position: absolute;
						right: 70px;
						top: 6px;
						font-size: 10px;
						line-height: 26px;
						padding: 0 26px;
						color: #ffffff;
						overflow: hidden;
					}
				}
				.chart-item{
					width:270px;
					height:178px;
					display: inline-block;
				}
			}
		}
	}
	.null-tip{
		font-size: 15px;
		text-align: center;
	}
	.loading{
		width: 100%;
		position: absolute;
		background-color: #051A47;
		opacity: 0.9;
		display: flex;
		align-items: center;
		justify-content: center;
		z-index: 9999;
		font-size: 22px;
		border-radius: 2px;
		.ivu-spin{
			color: #dddddd;
		}
	}
	.loading1{
		height: 467px;
		top: 40px;
	}
	.loading2{
		height: 361px;
		top: 40px;
	}
	.loading3{
		height: 504px;
		top: 40px;
		border-radius: 4px;
	}
	.loading4{
		height: 321px;
		top: 40px;
	}
</style>

<style scoped>
	.map-select>>>.ivu-select-dropdown{
		background-color:transparent;
	}
	.left .box-one >>>.swiper-container .swiper-wrapper,.right .box-two>>>.swiper-container .swiper-wrapper{
		-webkit-transition-timing-function: linear; /*之前是ease-out*/
		-moz-transition-timing-function: linear;
		-ms-transition-timing-function: linear;
		-o-transition-timing-function: linear;
		transition-timing-function: linear;
		cursor: pointer;
	}
	.swiper-container{
		cursor: pointer;
	}
	.map-title>>>.ivu-select-selection{
		background-color: rgba(255, 255, 255, 0.5);
		border-radius: 1px;
		font-family: PingFangSC-Regular, PingFang SC;
		font-weight: 400;
		color: #032146;
		border: none;
	}
	.demo-spin-icon-load{
		animation: ani-demo-spin 1s linear infinite;
	}
	@keyframes ani-demo-spin {
		from { transform: rotate(0deg);}
		50%  { transform: rotate(180deg);}
		to   { transform: rotate(360deg);}
	}
	.demo-spin-col{
		height: 300px;
		position: relative;
		border: 1px solid #eee;
	}
</style>
