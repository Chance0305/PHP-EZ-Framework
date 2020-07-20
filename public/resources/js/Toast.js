class Toast {
    constructor() {
        this.$toast = $(`<div id='toast'></div>`);
        this.bg_list = ['#888888', '#03a9f4', '#e91e63']

        $('body').append(this.$toast);
    }

    show(text, importance = 0, duration = 100) {
        this.$toast.text(text);
        this.$toast.css('background-color', this.bg_list[importance]);
        this.$toast.animate(
            { 'top': '30px', 'padding': '25px 50px', 'opacity': 1 }, duration, () => {
                setTimeout(() => {
                    this.$toast.animate({ 'top': '0px', 'padding': '0px', 'opacity': 0 });
                },1000);

                setTimeout(() => {
                    this.$toast.remove();
                },1500);
            }
        );
    }
}