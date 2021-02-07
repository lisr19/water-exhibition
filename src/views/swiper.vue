<template>
	<div class="swiper-box">
		<swiper  :options="swiperOptionWater"  ref="mySwiper">
			<swiper-slide v-for="(item,index) of swiperList" :key="item.id" >
				<div class="chart-item" :ref="'chart'+index+1" :class= "`echarts-box${item.id} `"></div>
			</swiper-slide>
		</swiper>
	</div>



</template>

<script>
	export default {
		props:['sevenData'],
		watch:{
			sevenData(val){
				this.swiperList = val.swiperList
				val.dateArray.forEach((i)=>{
					this.dateArray.push(i.substr(5,10))
				})
				if(this.swiperList.length){
					setTimeout(()=>{
						this.waterChart()
					},300)
				}
			}
		},
		data() {
			return {
				dateArray:[],
				swiperList: [],
				swiperOptionWater:{
					// direction : 'vertical',
					slidesPerGroup : 3,
					// notNextTick: true,
					slidesPerView: 3,
					observer:true,//修改swiper自己或子元素时，自动初始化swiper
					observeParents:true,//修改swiper的父元素时，自动初始化swiper
					// autoHeight: true,
					// lazy: true,
					// loop: true,
					speed:3000,//匀速时间
					autoplay: {
						delay: 40000,
						// stopOnLastSlide: false,
						disableOnInteraction: false,
					},

				},
				colorList:['#6098F9','#8791FE','#35B7AF','#6098F9',
					'#8791FE','#35B7AF','#6098F9','#8791FE','#35B7AF','#77bdf9',
					'#b76af9','#8791FE','#b78d70','#5872f9','#35B7AF','#35B7AF','#35B7AF','#8791FE'],
			}
		},
		computed: {
			swiper() {
				return this.$refs.mySwiper.$swiper
			},
		},
		methods:{
			waterChart() {
				// let myChart = this.$echarts.init(this.$refs.chart1)
				// 绘制图表
				let mytest=document.getElementsByClassName('chart-item');
				for(let i=0;i<mytest.length;i++){
					let myChart = this.$echarts.init(mytest[i]);
					// console.log(myChart);
					myChart.setOption({
						title: {
							text: this.swiperList[i].name,
							backgroundColor: this.colorList[i],
							// top:'9%',
							borderRadius: [0, 29, 29, 0],
							padding:[7,15,7,10],
							textStyle: {
								fontSize: 12,
								fontStyle: 'normal',
								fontWeight: 'normal',
								color:'#fff',
							},
						},
						tooltip: {
							trigger: 'axis',
							axisPointer: {
								type: 'cross',
								label: {
									backgroundColor: '#6a7985'
								}
							}
						},
						grid: {
							left: '3%',
							top:'28%',
							right: '5%',
							bottom: '6%',
							containLabel: true
						},
						xAxis: [
							{
								type: 'category',
								axisLine: {
									lineStyle: {
										type: 'solid',
										color: '#ccc',//左边线的颜色
										width: '1'//坐标线的宽度
									}
								},
								axisLabel: {
									inside: false,
									textStyle: {
										fontSize:'10',
										// color:'#ccc'
									}
								},
								boundaryGap: false,
								// data: ['一', '二', '三', '四', '五', '六', '日']
								data:this.dateArray
							}
						],
						yAxis: [
							{
								type: 'value',
								splitNumber:1,
								splitLine:{
									show:false
								},
								axisLabel: {
									inside: false,
									textStyle: {
										fontSize:'10',
										// color:'#ccc'
									}
								},
								axisLine: {
									lineStyle: {
										type: 'solid',
										color: '#ccc',//左边线的颜色
										width: '1'//坐标线的宽度
									}
								},
							}

						],
						series: [
							{
								type: 'line',
								stack: '总量',
								// data: [120, 132, 101, 134, 90, 230, 210],
								data: this.swiperList[i].count,
								lineStyle: {
									normal: {
										color: '#6098F9',
										width: 1
									}
								},
								areaStyle: {
									normal: {
										color: {
											type: 'linear',//设置线性渐变
											x: 0,
											y: 0,
											x2: 0,
											y2: 1,
											colorStops: [
												{offset: 0, color: this.colorList[i] // 100% 处的颜色
												},{
													offset: 1, color: '#fff' // 100% 处的颜色
												}],
											globalCoord: false // 缺省为 false
										},
									}
								},
								itemStyle: {
									emphasis: {
									},
									normal: {
										color: '#2DE4FA',
										// borderColor:'#2B3648',//拐点边颜色
										// borderWidth:1,//拐点边宽度
										lineStyle:{
											width:2,
											color:'#FDF169'
										}
									}
								}

							},
						]
					})
				}
			},
		},
		mounted() {
			// this.swiper.slideTo(3, 1000, false)
		},
		updated(){
			if(this.swiperList.length>1){
				this.swiper.init()
			}

		}
	}
</script>

<style lang="less" scoped>
	.swiper-box{
		background: rgba(0, 131, 209, 0.24);
		width: 979px;
		height: 198px;
		border-radius: 4px;
		display: flex;
		align-items: center;
		padding: 12px 34px;
		box-sizing: border-box;
	}
	.chart-item{
		width:270px;
		height:178px;
		display: inline-block;
		background: #184A8A;
	}
</style>