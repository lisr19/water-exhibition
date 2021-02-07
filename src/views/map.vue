
<template >
	<div class="map-wrap">
		<div id="container"></div>
		<div class="mark" @click.self="showVideo=false" v-if="showVideo">
			<div class="video-wrap" v-drag>
				<!--<img class="video-bg" src="@/assets/img/video-wrap.png" alt="" >-->
				<iframe id="monitor" src="demo/index.html" frameborder="0"  ref="mainIframe" name="monitor"></iframe>
				<img class="close-btn" src="@/assets/img/close.png" alt="" @click="showVideo=false">
			</div>
		</div>
	</div>

</template>
<script>
	import {mapActions} from 'vuex'
	import {getMapData,getNodeInfor} from '@/libs/API/comment'
	export default {
		props:['projectId','selectType','currCenter','szItem'],
		watch:{
			selectType(val){
				// console.log(val);
				this.closeInfo()
				this.selectType =val
				this.mapData = []
				if(this.selectType==='摄像头'){
					this.mapData =this.allData.video_node_list
				}else if(this.selectType==='水环境监测'){
					this.mapData =this.allData.environment_node_list

				}else if(this.selectType==='水质检测'){
					this.mapData =this.allData.resources_node_list
				}else {
					this.mapData =this.allData.node_list
				}
				// this.initMap()
				this.initMarker()
			},
			//水质数据快速定位
			szItem(val){
				// console.log(val);
				this.mapCenter = val.coordinate.split(',')
				// console.log(this.mapCenter);
				this.map.setCenter(this.mapCenter)
			},
			projectId(val){
				// console.log(val);
				setTimeout(()=>{
					this.getMapData({project_id:val})
				},1000)
			},
			currCenter(val){
				this.mapCenter = val.split(',')
				// console.log(this.mapCenter);
				this.map.setCenter(this.mapCenter)
				// this.initMap()
			}
		},
		data() {
			return {
				cluster: [],
				allData:{},
				nodeInfor:{},
				resInfo:{},
				envInfo:{},
				videoInfo:{},
				itemInfo:{},
				showTip:false,
				showVideo:false,
				isShow:false,
				marker: {}, //点标记
				markers: [], //点集合
				map: {}, //地图对象
				iconData: {}, //地图对象
				mapCenter:[113.445775,23.072598]
			};
		},
		mounted() {
			// if(this.projectId){
			// 	console.log(111);
			// 	this.getMapData({project_id:this.projectId})
			// }
		},
		methods: {
			...mapActions([
				'setWaterInfo'
			]),
			async getMapData(params){
				let res = await getMapData(params)
				if (res.errno === 0) {
					this.allData = res.data
					this.mapData = res.data.node_list
					this.mapCenter = this.mapData[0].coordinate.split(',')
					// this.mapCenter = [113.39099,23.073196]
					setTimeout(() => {
						this.initMap();
					}, 100);
				} else {
					console.log('获取地图数据失败');
				}
			},
			async getNodeInfor(params){
				let res = await getNodeInfor(params)
				if (res.errno === 0) {
					this.$nextTick(()=>{
						if(res.data){
							this.nodeInfor =res.data
							this.resInfo =this.nodeInfor.resources_info || ''
							this.envInfo =this.nodeInfor.environment_info||''
							this.videoInfo =this.nodeInfor.video_info||''
						}
					})
				} else {
					console.log('获取节点详情数据失败');
				}
			},
			//初始化地图
			initMap() {
				//创建地图
				this.map = new AMap.Map("container", {
					cursor: "default",
					mapStyle: "amap://styles/blue",
					resizeEnable: true, //是否监控地图容器尺寸变化，默认值为false
					expandZoomRange: true, //是否支持可以扩展最大缩放级别,和zooms属性配合使用设置为true的时候，zooms的最大级别在PC上可以扩大到20级，移动端还是高清19/非高清20
					// gestureHandling: "greedy",//谷歌里面的// hybrid包含卫星和地名
					zooms: [3, 20],
					zoom:13,
					zoomToAccuracy: true,
					// center: [113.445775,23.072598],
					center: this.mapCenter,
					defaultCursor: "pointer", //变成小手 地图默认鼠标样式。参数defaultCursor应符合CSS的cursor属性规范
					showLabel: true, //显示地图文字标记
					layers: [
						new AMap.TileLayer.Satellite(), //默认卫星
						// new AMap.TileLayer.RoadNet(), //地图路网
						new AMap.Buildings({// 楼块图层
						  zooms: [16, 18],
						  zIndex: 10,
						  heightFactor: 2 //2倍于默认高度，3D下有效
						})
					], //Satellite卫星地图，RoadNet路网，地图图层数组，数组可以是图层 中的一个或多个，默认为普通二维地图。当叠加多个图层时，普通二维地图需通过实例化一个TileLayer类实现
					// viewMode: "3D", //是否3d视角
					// pitch: 40 //俯仰角度，默认0，[0,83]，2D地图下无效 。（自V1.4.0开始支持）
				})
				AMap.event.addListener(this.map,'click', (e) =>{ //添加点击事件,传入对象名，事件名，回调函数
					console.log(e.lnglat);
					this.closeInfo()
				})
				this.map.addControl(new AMap.MapType({
					defaultType:1 //0代表默认，1代表卫星
				}));
				setTimeout(()=>{
					this.initMarker()
				},500)
			},
			initMarker(){
				this.removeArea()
				// 创建一个 Icon
				// 水位
				let w1 = new AMap.Icon({
					// 图标尺寸
					size: new AMap.Size(38, 48),
					// 图标的取图地址
					image: require('@/assets/icons/w1.png'),
					// 图标所用图片大小
					imageSize: new AMap.Size(38, 45),
					// 图标取图偏移量
					// imageOffset: new AMap.Pixel(-15, -3)
				});
				//水资源
				let w2 = new AMap.Icon({
					// 图标尺寸
					size: new AMap.Size(38, 48),
					// 图标的取图地址
					image: require('@/assets/icons/w2.png'),
					// 图标所用图片大小
					imageSize: new AMap.Size(38, 45),
					// 图标取图偏移量
					// imageOffset: new AMap.Pixel(-15, -3)
				});
				//摄像头
				let w3 = new AMap.Icon({
					// 图标尺寸
					size: new AMap.Size(38, 48),
					// 图标的取图地址
					image: require('@/assets/icons/w3.png'),
					// 图标所用图片大小
					imageSize: new AMap.Size(38, 45),
					// 图标取图偏移量
					// imageOffset: new AMap.Pixel(-15, -3)
				});
				//摄像头，水位
				let w4 = new AMap.Icon({
					// 图标尺寸
					size: new AMap.Size(78, 45),
					// 图标的取图地址
					image: require('@/assets/icons/w4.png'),
					// 图标所用图片大小
					imageSize: new AMap.Size(78, 35),
					// 图标取图偏移量
					// imageOffset: new AMap.Pixel(-15, -3)
				});
				//色度，水位
				let w5 = new AMap.Icon({
					// 图标尺寸
					size: new AMap.Size(78, 45),
					// 图标的取图地址
					image: require('@/assets/icons/w5.png'),
					// 图标所用图片大小
					imageSize: new AMap.Size(78, 35),
					// 图标取图偏移量
					// imageOffset: new AMap.Pixel(-15, -3)
				});
				//色度，摄像头
				let w6 = new AMap.Icon({
					// 图标尺寸
					size: new AMap.Size(78, 45),
					// 图标的取图地址
					image: require('@/assets/icons/w6.png'),
					// 图标所用图片大小
					imageSize: new AMap.Size(78, 35),
					// 图标取图偏移量
					// imageOffset: new AMap.Pixel(-15, -3)
				});
				//色度，摄像头，水位
				let w7 = new AMap.Icon({
					// 图标尺寸
					size: new AMap.Size(108, 45),
					// 图标的取图地址
					image: require('@/assets/icons/w7.png'),
					// 图标所用图片大小
					imageSize: new AMap.Size(100, 35),
					// 图标取图偏移量
					// imageOffset: new AMap.Pixel(-15, -3)
				});
				let iconData =[]
				this.mapData.forEach((i)=>{
					i.coordinate = i.coordinate.split(',')
					i.coordinate[0]=parseFloat(i.coordinate[0])
					i.coordinate[1]=parseFloat(i.coordinate[1])
					if(i.type===1){
						iconData.push({icon:w3,position:i.coordinate,name:i.name,id:i.id})
					}else if(i.type===2){
						iconData.push({icon:w2,position:i.coordinate,name:i.name,id:i.id})
					}else if(i.type===3){
						iconData.push({icon:w1,position:i.coordinate,name:i.name,id:i.id})
					}else if(i.type===4){
						iconData.push({icon:w6,position:i.coordinate,name:i.name,id:i.id})
					}else if(i.type===5){
						iconData.push({icon:w4,position:i.coordinate,name:i.name,id:i.id})
					}else if(i.type===6){
						iconData.push({icon:w5,position:i.coordinate,name:i.name,id:i.id})
					}else {
						iconData.push({icon:w7,position:i.coordinate,name:i.name,id:i.id})
					}
				})
				iconData.forEach((i)=>{
					if(this.selectType==='摄像头'){
						i.icon =w3
					}else if(this.selectType==='水质检测'){
						i.icon =w2
					}else if(this.selectType==='水环境监测'){
						i.icon =w1
					}
					let marker = new AMap.Marker({
						position:new AMap.LngLat(i.position[0],i.position[1]),
						// offset: new AMap.Pixel(-10, -10),
						icon: i.icon, // 添加 Icon 实例
						zoom: 10,
						extData:{
							name:i.name,
							id:i.id,
							position:i.position,
						}
					})
					// this.map.add(marker);
					// console.log(marker);
					this.markers.push(marker)
					marker.on('click',(e)=>{
						console.log(e);
						// console.log(e.target.getExtData());
						this.getNodeInfor({id:e.target.getExtData().id})
						setTimeout(()=>{
							this.openInfo(marker)
						},300)
						// console.log('markerClick');
						// console.log(e.lnglat.lat);
						// this.$store.dispatch('setWaterInfo',this.currentItem)

					})
				})
				this.map.add(this.markers);
				//设置聚合样式
				// let renderClusterMarker =  (context) =>{
				// 	let factor = Math.pow(context.count / count, 1 / 18)
				// 	let div = document.createElement('div')
				// 	let Hue = 180 - factor * 180
				// 	let bgColor = 'hsla(' + Hue + ',100%,40%,0.7)'
				// 	let fontColor = 'hsla(' + Hue + ',100%,90%,1)'
				// 	let borderColor = 'hsla(' + Hue + ',100%,40%,1)'
				// 	let shadowColor = 'hsla(' + Hue + ',100%,90%,1)'
				// 	div.style.backgroundColor = bgColor
				// 	let size = Math.round(30 + Math.pow(context.count / count, 1 / 5) * 20)
				// 	div.style.width = div.style.height = size + 'px'
				// 	div.style.border = 'solid 1px ' + borderColor
				// 	div.style.borderRadius = size / 2 + 'px'
				// 	div.style.boxShadow = '0 0 5px ' + shadowColor
				// 	div.innerHTML = context.count
				// 	div.style.lineHeight = size + 'px'
				// 	div.style.color = fontColor
				// 	div.style.fontSize = '14px'
				// 	div.style.textAlign = 'center'
				// 	context.marker.setOffset(new AMap.Pixel(-size / 2, -size / 2))
				// 	context.marker.setContent(div)
				// }
				// let sts = [{
				// 	// 图标的取图地址
				// 	url: "//a.amap.com/jsapi_demos/static/images/blue.png",
				// 	size: new AMap.Size(32, 32),
				// 	offset: new AMap.Pixel(-16, -16)
				// }, {
				// 	url: "//a.amap.com/jsapi_demos/static/images/orange.png",
				// 	size: new AMap.Size(36, 36),
				// 	offset: new AMap.Pixel(-18, -18)
				// }, {
				// 	url: "//a.amap.com/jsapi_demos/static/images/red.png",
				// 	size: new AMap.Size(48, 48),
				// 	offset: new AMap.Pixel(-24, -24)
				// }, ];

				this.map.plugin(["AMap.MarkerClusterer"],()=> {
					this.cluster = new AMap.MarkerClusterer(this.map, this.markers, {
						// styles: sts,
						minClusterSize:2,
						maxZoom:18,
						gridSize: 60,
					});
				});

			},
			removeArea() {
				// this.map.clearMap();
				this.map.remove(this.markers);
				this.markers = [];

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
			closeInfo(){
				this.map.clearInfoWindow();
			},
			openInfo(marker) {
				let itemData = marker.getExtData()
				let div
				if(Object.keys(this.nodeInfor).length==0){
					div =`<div class="win-wrap">
								<div class="win-title">${itemData.name}</div>
								<div class="win-content">
									<p>坐标点：${itemData.position}</p>
									<p>暂无数据</p>
								</div>
								<span class="win-close-btn" onclick='closeWin()' >X</span>
							</div>`
				}else {
					div =`<div class="win-wrap">
								<div class="win-title">${itemData.name}</div>
								<div class="win-content">
									<p>坐标点：${itemData.position}</p>
									<div class="cont" v-if="${this.resInfo}">
										<p class="title">水质监控数据</p>
										<span id="temperature">温度：${this.resInfo.temperature||' '}<em>℃</em></span>
										<span id="chrominance">色度：${this.resInfo.chrominance||' '}<em>℃</em></span>
										<span id="turbidity">浊度：${this.resInfo.turbidity||' '}<em>NTU</em></span>
										<span id="PH">PH：${this.resInfo.PH||' '}<em></em></span>
										<span id="COD">化学需氧量：${this.resInfo.COD||' '}<em>mg/L</em></span>
										<span id="TOC">有机含碳量：${this.resInfo.TOC||' '}<em>mg/L</em></span>
										<span id="dissolved_oxygen">溶解氧：${this.resInfo.dissolved_oxygen||' '}<em>mg/L</em></span>
										<span id="EC">电导率：${this.resInfo.EC||' '}<em>mS/cm</em></span>
										<span id="suspended">漂浮物：${this.resInfo.suspended||' '}<em>mg/L</em></span>
										<span id="cadmium_ion">铬离子：${this.resInfo.cadmium_ion||' '}<em>ppm</em></span>
										<span id="cryanide_ion">氰离子：${this.resInfo.cryanide_ion||' '}<em>ppm</em></span>
										<span id="lead_ion">铅离子：${this.resInfo.lead_ion||' '}<em>ppm</em></span>
										<span id="chlorophyll">叶绿素：${this.resInfo.chlorophyll||' '}<em>ug/L</em></span>
									</div>
									<div class="cont" v-if="${this.envInfo}">
										<p class="title">水环境数据</p>
										<span v-if="${this.envInfo.level}">水位：${this.envInfo.level||' '}<em>M</em></span>
										<span v-if="${this.envInfo.speed}">流量：${this.envInfo.speed||' '}<em>m³/s</em></span>
										<span v-if="${this.envInfo.rainfall}">雨量：${this.envInfo.rainfall||' '}<em>mm</em></span>
									</div>
									<div class="cont" v-if="${this.videoInfo}">
										<p class="title">摄像头</p>
										<p class="v-btn"  onclick='openVideo(this.videoInfo)'>查看实时监控</span>
									</div>
								</div>
								<span class="win-close-btn" onclick='closeWin()' >X</span>
							</div>`
				}
				// console.log(marker);
				// console.log(marker.getExtData());

				//创建信息窗体
				let infoWindow = new AMap.InfoWindow({
					isCustom: true,  //使用自定义窗体
					anchor: 'bottom-center',
					offset: new AMap.Pixel(20, -23),
					content:div
				});
				setTimeout(()=>{
					if(!this.resInfo.temperature){
						document.getElementById('temperature').classList.add("null")
					}
					if(!this.resInfo.chrominance){
						document.getElementById('chrominance').classList.add("null")
					}
					if(!this.resInfo.turbidity){
						document.getElementById('turbidity').classList.add("null")
					}
					if(!this.resInfo.PH){
						document.getElementById('PH').classList.add("null")
					}
					if(!this.resInfo.COD){
						document.getElementById('COD').classList.add("null")
					}
					if(!this.resInfo.TOC){
						document.getElementById('TOC').classList.add("null")
					}
					if(!this.resInfo.EC){
						document.getElementById('EC').classList.add("null")
					}
					if(!this.resInfo.suspended){
						document.getElementById('suspended').classList.add("null")
					}
					if(!this.resInfo.dissolved_oxygen){
						document.getElementById('dissolved_oxygen').classList.add("null")
					}
					if(!this.resInfo.cadmium_ion){
						document.getElementById('cadmium_ion').classList.add("null")
					}
					if(!this.resInfo.cryanide_ion){
						document.getElementById('cryanide_ion').classList.add("null")
					}
					if(!this.resInfo.lead_ion){
						document.getElementById('lead_ion').classList.add("null")
					}
					if(!this.resInfo.chlorophyll){
						document.getElementById('chlorophyll').classList.add("null")
					}
				},200)
				window.openVideo=()=>{
					this.showVideo = true
					setTimeout(()=>{
						this.setData(this.videoInfo)
						this.map.clearInfoWindow();
					},300)
				},
				window.closeWin=()=>{
					this.map.clearInfoWindow();
				}
				infoWindow.open(this.map,marker.getPosition()); //信息窗体打开
				// console.log(marker.getPosition());
				// this.map.setCenter(marker.getPosition())
			},
		},
		beforeDestroy() {}
	};
</script>
<style lang="less">
	.mark{
		width: 100%;
		height: 100%;
		position: fixed;
		top: 0;
		left: 0;
		background: rgba(0,0,0,0.3);
		display: flex;
		align-items: center;
		justify-content: center;
		z-index: 99999;
	}
	.video-wrap{
		width: 630px;
		height: 600px;
		background:url("../assets/img/video-wrap.png") no-repeat;
		background-size: 100% 100%;
		position: absolute;
		display: flex;
		align-items: center;
		justify-content: center;
		flex-direction: column;
		cursor: pointer;
		.close-btn{
			position: absolute;
			top: 15px;
			right:40px;
			width: 40px;
			height: 40px;
			cursor: pointer;
			z-index: 100;
		}
		.btn-group{
			bottom: 0;
			img{
				width: 27px;
				height: 27px;
			}
		}
	}
	#monitor{
		width:550px;
		height:520px;
		overflow: hidden;
		position: absolute;
		left: 34px;
		border-radius: 10px;
	}
	.win-wrap{
		z-index: 99999;
		border-radius:5px;
		width: 100%;
		height: 100%;
		/*background: rgba(255, 255, 255, 0.68);*/
		background: rgba(7, 42, 76, 0.82);
		position: relative;
		padding-bottom: 10px;
		.win-close-btn{
			position: absolute;
			top: -10px;
			right: -3px;
			font-size: 18px;
		}
		.win-title{
			padding:5px 10px;
			font-size: 16px;
			color: #C2FFCA;
			background: rgba(7, 42, 76, 0.82);

		}
		.win-content{
			padding:5px 10px;
			font-size: 14px;
			/*color: #00214D;*/
			text-align: left;
			.cont{
				.title{
					color: #da6f14;
					font-size: 15px;
					margin-top: 10px;
				}
				.v-btn{
					width: 100px;
					height: 30px;
					line-height: 30px;
					border-radius: 4px;
					color: #ffffff;
					text-align: center;
					background-color: #2b85e4;
					margin-top: 5px;
				}
				span{
					margin-right: 20px;
				}
			}
			.null{
				display: none;
			}
		}
	}
	#container {
		/*height: calc(100% - 100px);*/
		height: 673px;
		width: 100%;
	}
	.markerCss {
		font-size: 16px;
		font-weight: 700;
		color: #fff;
	}
	.showTip{
		position: absolute;
		/*background: #348EED;*/
		top: 0;
		left: 0;
		bottom: 0;
		right: 0;
	}
	.amap-maptype-wrap{
		top: 58px;
	}
	.amap-maptype-list{
		display: none!important;
	}
	.amap-maptype-list{
	display: none!important;
	}
	.amap-maptype-con{
	border: solid 1px #348EED;
	overflow: hidden;
	}
	.amap-maptype-title{
	}
	.amap-info-content{
		color: #666666;
	}
	.map-wrap{
		position: relative;
		.tip{
			min-height: 400px;
			min-width: 600px;
			background: rgba(7, 42, 76, 0.82);
			position: absolute;
			top: 50%;
			left: 50%;
			transform: translate(-50%, -50%);
		}
	}
	/*.amap-maptype-title{*/
		/*display: none;*/
	/*}*/
</style>

