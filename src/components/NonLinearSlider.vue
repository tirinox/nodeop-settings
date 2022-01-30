<template>
    <v-slider
        max="10000"
        min="0"
        v-model="internalValue"
        color="red"
    ></v-slider>
</template>

<script>
export default {
    name: "NonLinearSlider",
    data() {
        return {
            internalValue: 0
        }
    },
    props: {
        value: {
            type: Number,
            required: true
        },
        minValue: {
            types: Number,
            default: 0
        },
        maxValue: {
            types: Number,
            default: 100
        },
        polynomial: {
            types: Number,
            default: 3.0,
        }
    },
    // mounted() {
    //     this.internalValue = this.transformToInternal(this.value)
    // },
    methods: {
        transformToInternal(v) {
            return 10000.0 * Math.pow(
                ((Number(v) - this.minValue) / (this.maxValue - this.minValue)),
                1.0 / this.polynomial
            )
        },
        transformToExternal(v) {
            return (this.maxValue - this.minValue) * Math.pow(Number(v) / 10000.0, this.polynomial) + this.minValue
        },
        updateRealValue(v) {
            // const v = Number(this.$refs.slider.value)
            console.log(v, " ===> ", this.transformToExternal(v))
            // this.$emit('input', this.transformToExternal(v));
        }
    },
    // watch: {
    //     internalValue(newV) {
    //         this.$emit('input', this.transformToExternal(newV));
    //     }
    // }
}
</script>

<style scoped>

</style>