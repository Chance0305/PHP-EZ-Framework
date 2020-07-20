const log = console.log;

Date.prototype.getFormat = function() {
    return `${this.getFullYear()}-${(this.getMonth() + 1).toString().padStart(2, '0')}-${this.getDate().toString().padStart(2, '0')}`;
}

String.prototype.getFormat = function() {
    return `${this.substring(0, 4)}-${this.substring(4, 6)}-${this.substring(6, 8)}`;
}


class App {
    constructor() {
        this.datas = [];
        this.render_datas = [];
        this.cart_datas = [];
        this.purchase_datas = [];
        this.dc_price = 1;
        this.$PRODUCT_LIST = $("#product-list table tr:nth-child(2)");
        this.$CART_LIST = $("#cart-list table tr:nth-child(2)");

        this.init();
    }
    
    async init() {
        $("#product-list table tr:nth-child(n+2)").remove();
        $("#cart-list table tr:nth-child(n+2)").remove();
        $(".modal").dialog({'autoOpen': false, 'modal': true});
        
        this.datas = await this.loadData();
        this.datas.map( data => data.price = parseInt(data.price.replace(/,/g, '')) );
        this.render_datas = this.datas;
        this.cart_datas = localStorage.cart_datas ? JSON.parse(localStorage.cart_datas) : [];
        if ( $("#suggest-mall-page").length == 1 ) this.cart_datas = [];
        this.purchase_datas = localStorage.purchase_datas ? JSON.parse(localStorage.purchase_datas) : [];

        this.setEventHandlers();
        this.updateProductList();
        this.updateCartList();
    }

    loadData() {
        return $.getJSON('/resources/data/item.json');
    }

    updateProductList() {
        $("#product-list table tr:nth-child(n+2)").remove();

        this.render_datas.forEach(data => {
            const clone = this.$PRODUCT_LIST.clone();

            clone.find("td").eq(0).text(data.id);
            clone.find("td").eq(1).text(data.product_name);
            clone.find("td").eq(2).text(data.price.toLocaleString());
            clone.find("button").attr('data-idx', data.id);
            clone.find("input").attr('data-idx', data.id);

            const cart = this.cart_datas.find(x => x.idx == data.id);
            if ( cart ) clone.find("input").val(cart.cnt);
            else clone.find("input").val(1);

            $("#product-list table").append(clone);
        });
    }
    
    updateCartList() {
        $("#cart-list table tr:nth-child(n+2)").remove();
        
        this.cart_datas.forEach(cart => {
            const data = this.datas.find(x => x.id == cart.idx);
            const clone = this.$CART_LIST.clone();

            clone.find("td").eq(0).text(data.product_name);
            clone.find("td").eq(1).text(cart.cnt);
            clone.find("td").eq(2).text(data.price.toLocaleString());
            clone.find("td").eq(3).text((data.price * this.dc_price).toLocaleString()); // 할인가에 관한 내용이 문제에 없는뎅..
            clone.find("td").eq(4).text(cart.cnt); // 담은 개수 != 구매 개수 ???
            clone.find("td").eq(5).text((data.price * this.dc_price * cart.cnt).toLocaleString());

            $("#cart-list table").append(clone);
        });
    }

    setEventHandlers() {
        $(document).on('click', '.plus-btn', this.indecreaseCnt.bind(this));
        $(document).on('click', '.minus-btn', this.indecreaseCnt.bind(this));
        $(document).on('click', '.cart-btn', this.addCart.bind(this));
        $(document).on('click', '.buy-btn', this.openBuyModal.bind(this));
        $(document).on('change', '#buy-modal select[name="d_date"]', this.deactivateDeliveryTime.bind(this));
        $(document).on('click', '.buy-confirm-btn', this.buyCart.bind(this));

        $(document).on('click', '.request-btn', this.openRequestModal.bind(this));
        $(document).on('click', '.request-confirm-btn', this.comfirmRequest.bind(this));

        $(document).on('click', '.suggest-confirm-btn', this.comfirmSuggest.bind(this));
        $(document).on('click', '.sibal_jonna_hagi_shilta', this.asdasdasdsadasdasdas.bind(this));
        $(document).on('click', '.gogogogogogo', this.gogogogogogo.bind(this));
    }
    
    indecreaseCnt() {
        const input = $(event.target).parent().parent().find('input');
        let value = input.val();
        
        if ( $(event.target).hasClass('plus-btn') ) {
            value++;
            input.val(value);
            return;
        }
        
        if ( value == 1 ) {
            new Toast().show('최소 구매 수량은 1개 입니다', 2);
            return;
        }
        
        value--;
        input.val(value);
    }

    addCart() {
        const idx = $(event.target).data('idx');
        const data = this.datas.find(x => x.id == idx);
        const cart = this.cart_datas.find(x => x.idx == idx);
        let cnt = parseInt( $(event.target).parent().parent().find('input').val() );

        if ( cart ) {
            cart.cnt += cnt;
            new Toast().show('추가 상품이 담겼습니다.', 1);
        } else {
            this.cart_datas.push( {'idx': data.id, 'product_name': data.product_name, 'cnt': cnt} );
            new Toast().show('장바구니에 담겼습니다.', 1);
        }
        
        if( $("#suggest-mall-page").length != 1) localStorage.cart_datas = JSON.stringify(this.cart_datas);
        this.updateCartList();
    }

    openBuyModal() {
        if ( this.cart_datas.length < 1 ) {
            new Toast().show('상품을 담아주세요.', 2);
            return;
        }

        // reset field
        $("#buy-modal select").val('');

        $('#buy-modal').dialog('open');
    }

    deactivateDeliveryTime() {
        let d_date = $("#buy-modal select#d_date").val().getFormat();
        let d_times = this.purchase_datas.filter(x => x.d_date == d_date).map(x => x.d_time);
        
        d_times.forEach(x => $(`#buy-modal select#d_time option[value='${x}']`).attr('disabled', 'true') );
    }

    buyCart() {
        const print_keys = ['배송일', '배송시간', '구매자명', '전화번호', '우편번호', '주소', '상세 주소'];
        const keys = ['d_date', 'd_time', 'name', 'phone', 'zip', 'address', 'address_detail'];
        const values = [...$("#buy-modal .form").find("input, select")].map(x => x.value);
        let fields = keys.reduce((s,v,i) => ({...s, [v]:values[i]}), {});

        let isValid = true;

        for( let i=0; i<keys.length; i++ ) {
            if ( fields[keys[i]].trim() == "" ) {
                new Toast().show(`${print_keys[i]}은(는) 필수 입력 사항입니다.`, 2);
                isValid = false;
            }
        }

        if ( !fields.name.match(/^[가-힣ㄱ-ㅎㅏ-ㅣ]{2,7}$/) ) {
            new Toast().show('이름이 입력 조건에 일치하지 않습니다.', 2);
            isValid = false;
        }
        if ( !fields.phone.match(/^[0-9]{3}-[0-9]{4}-[0-9]{4}$/) ) {
            new Toast().show('올바른 전화번호 형태는 000-0000-0000입니다.', 2);
            isValid = false;
        }
        if ( !fields.zip.match(/^[0-9]{5}$/) ) {
            new Toast().show('우편번호는 5자리 숫자만 가능합니다.', 2);
            isValid = false;
        }

        if ( !isValid ) return;

        fields.d_date = fields.d_date.getFormat();
        fields.p_date = new Date().getFormat();
        fields.carts = this.cart_datas;

        fields.price = 0;
        this.cart_datas.forEach(data => {
            fields.price += this.datas.find(x => x.id == data.idx).price;
        });
        
        let newdata = {};
        newdata['d_date'] = fields.d_date;
        newdata['d_time'] = fields.d_time;
        newdata['name'] = fields.name;
        newdata['p_date'] = fields.p_date;
        newdata['price'] = fields.price;
        fields.carts.forEach( cart => cart['product_name'] = this.datas.find(x => x.id == cart.idx).product_name );
        newdata['purchases'] = fields.carts;
        this.purchase_datas.push(newdata);
        localStorage.purchase_datas = JSON.stringify(this.purchase_datas);

        this.cart_datas = [];
        this.updateCartList();
        localStorage.removeItem('cart_datas');

        this.insertPurchaseDataToDB(newdata);

        $("#buy-modal").dialog('close');
        new Toast().show('구매가 정상 처리 되었습니다.', 1);
    }

    insertPurchaseDataToDB(datas) {
        $.ajax({
            type: "post",
            url: "/mall/buy",
            data: {purchase_data: datas},
            success : function(data) {
                log(data);
            }
        })
    }

    openRequestModal() {
        $("#request-modal input").val('');
        $("#request-modal").dialog("open");
    }

    comfirmRequest() {
        let title = $("#request-modal input[id='title']").val();
        let limit = $("#request-modal input[id='limit']").val();
        let range = $("#request-modal input[id='range']").val();
        let post_data = {'title': title, 'limit': limit, 'range': range};

        if ( title == "" || limit == "" || range == "" || range > 10000 || (limit/2) < range ) {
            new Toast().show('누락 되었거나 조건에 맞지 않습니다.', 2);
            return;
        }

        $.ajax({
            type: 'post',
            url: '/request/request',
            data: {'datas': post_data},
            success: function(data) {
                log(data)
            }
        })

        alert('요청이 완료되었습니다');
        location.reload();
    }

    comfirmSuggest() {
        const ridx = $(event.target).data("ridx");

        if ( this.cart_datas.length < 1 ) {
            new Toast().show("먼저 상품을 담아주세요.", 2);
            return;
        }

        const post_data = {'ridx': ridx, 'items': this.cart_datas};

        $.ajax({
            type: 'post',
            url: '/suggest/suggest',
            data: {'datas': post_data},
            success: function(data) {
                log(data)
            }
        })

        alert('제안이 완료되었습니다');
        location.href ='/suggest';
    }

    gogogogogogo() {
        const ridx = $(event.target).data("ridx");
        let items = $(`.items-hidden[data-ridx='${ridx}']`).text();

        log(items);


        $("#detail-modal").text('');
        $("#detail-modal").text(items);
        $("#detail-modal").dialog("open");
    }

    asdasdasdsadasdasdas() {
        const sidx = $(event.target).data("sidx");
        $.ajax({
            type: 'get',
            url: '/request/commit',
            data: {'sidx': sidx},
            success : function(data) {
                log(data);
            }
        })
    }
}

class Stats {
    constructor() {
        this.graph_datas = [];
        this.table_datas = [];
        this.purchase_datas = [];

        this.$TABLE_LIST = $("#admin-page #admin-table table tr:nth-child(2)");
        this.canvas = document.querySelector("canvas#graph");
        this.ctx = this.canvas.getContext("2d");

        this.init();
    }

    loadGraphDataFromDB() {
        return $.ajax({
            type: "get",
            url: "/admin/getGraphData"
        })
    }

    loadTableDataFromDB() {
        return $.ajax({
            type: "get",
            url: "/admin/getTableData"
        })
    }

    async init() {
        $("#admin-page #admin-table table tr:nth-child(n+2)").remove();

        this.graph_datas = JSON.parse( await this.loadGraphDataFromDB() );
        this.table_datas = JSON.parse( await this.loadTableDataFromDB() );
        this.render_datas = {};
        
        this.graph_datas.forEach(data => {
            for( let i=0; i<7; i++ ) {
                let date = new Date(new Date() - (1000*60*60*24*(i + 1))).getFormat();

                if(data.p_date == date) {
                    if ( typeof this.render_datas[date] == 'undefined' ) {
                         this.render_datas[date] = parseInt(data.price);
                         return;
                        }
                        
                        this.render_datas[date] += parseInt(data.price);
                }
            }
        });

        this.updateGraph();
        this.updateTable();
    }

    updateGraph() {
        new BarGraph(this.canvas, this.render_datas);
    }

    updateTable() {
        this.table_datas.forEach(data => {
            const clone = this.$TABLE_LIST.clone();

            clone.find("td").eq(0).text(data.name);
            clone.find("td").eq(1).text(data.product_name);
            clone.find("td").eq(2).text(data.cnt);
            clone.find("td").eq(3).text(data.p_date);
            
            $("#admin-page #admin-table table").append(clone);
        });
    }
}

class BarGraph {
    constructor(canvas, datas) {
        this.datas = datas;
        this.d_length = Object.keys(this.datas).length;
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');

        this.padding = 50;
        this.width = canvas.width;
        this.height = canvas.height;
        this.inner_width = this.width - (this.padding * 2);
        this.inner_height = this.height - (this.padding * 2);
        this.barWidth = 40;

        this.drawGraph();
    }

    drawGraph() {
        // Draw Axle
        this.drawline(0, 0, 0, this.height - (this.padding * 2));
        this.drawline(0, 0, this.width - (this.padding * 2), 0);

        const max = Math.max(...Object.values(this.datas));
        const min = Math.min(...Object.values(this.datas));
        const colors = ["#f88", "#ff8", "#8f8", "#8ff", "#88f"];

        for ( let i=0; i<this.d_length; i++ ) {
            const val = Object.values(this.datas)[i];
            const key = Object.keys(this.datas)[i];

            const barHeight = val / max * this.inner_height;
            const barX = (this.inner_width / (this.d_length + 1)) * (i+1) - (this.barWidth / 2);

            this.ctx.fillStyle = colors[i];
            this.drawBar(barX, 1, this.barWidth, barHeight);
            this.ctx.fillStyle = "#333";
            this.drawText(key, barX, -20);
            this.drawText(val, barX, barHeight + 20);
        }
    }

    drawline(x, y, dx, dy) {
        this.ctx.beginPath();
        this.ctx.moveTo(this.padding + x, this.height - this.padding - y);
        this.ctx.lineTo(this.padding + dx, this.height - this.padding - dy);
        this.ctx.stroke();
    }

    drawBar(x, y, w, h) {
        let barX = this.padding + x;
        let barY = this.height - this.padding - y - h;
        this.ctx.fillRect(barX, barY, w, h);
    }

    drawText(text, x, y) {
        this.ctx.textAlign = "center";
        this.ctx.fillText(text, this.padding + x + (this.barWidth / 2), this.height - this.padding - y);
    }
}