<template>
		GAME
    <canvas id="canvas"></canvas>
		<v-btn @click="drawRect">PRESS</v-btn>
</template>

<script>
export default {
	data () {
			return {
				vueCanvas: null,
				rectWidth: 200
			};
	},
	mounted() {
		var c = document.getElementById("canvas");
		var ctx = c.getContext("2d");
		this.vueCanvas = ctx;
	},

	methods: {
		  drawRect() {
      // clear canvas
      this.vueCanvas.clearRect(0, 0, 400, 200);
      
      // draw rect
      this.vueCanvas.beginPath();
			this.vueCanvas.strokeStyle = 'red';
      this.vueCanvas.rect(20, 20, this.rectWidth, 100);
      this.vueCanvas.stroke();      
    },
    addWidth() {
      this.rectWidth += 10
      this.drawRect()
    },
    subWidth() {
      this.rectWidth -= 10
      this.drawRect()      
    }
  }
};
</script>
