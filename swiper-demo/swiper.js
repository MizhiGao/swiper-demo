class Swiper {
    constructor(prop) {
        this.state = {
            elIdParent: prop.swiper.elIdParent,
            elClassChild: prop.swiper.elClassChild,
            id: prop.id,
            duration: prop.duration,
            isLock: false,
            isActive: 0,
            index: 0,
            translateX: 0,
            itemWidth: null,
            defaultLength: null,
            loop: prop.loop,
            loopTime: prop.loopTime,
        };
        this.pagination = {
            elClassParent: prop.pagination.elClassParent,
            elClassChild: prop.pagination.elClassChild,
            elChildActive: prop.pagination.elChildActiveClass,
        }
        this.navigation = {
            nextEl: prop.navigation.nextEl,
            prevEl: prop.navigation.prevEl,
        }
        
        this._$ = selector => document.querySelector(selector);
        this._createElement = type => document.createElement(type);
        this._setContent = (elem, content) => elem.textContent = content;
        this._appendChild = (container, node) => container.appendChild(node);
        this._onEventListener = (parentNode, action, childClassName, callback) => {
            parentNode.addEventListener(action, function (e) {
                e.target.className === childClassName && callback(e)
            })
        }

        this._init();
    };
    _init() {
        this._addHTML();
        this._clone();
        this._bind();
    };
    _bind() {
        let $ = this._$;
        let swiperContainer = $(`#${this.state.elIdParent}`).parentNode;

        var timer;
        if (this.state.loop) {
            timer = setInterval(() => this._nextArrow(), this.state.loopTime);
            //function stop(){
            //    clearInterval(timer)
            // }
            //swiperContainer.onmouseover = stop;
            //swiperContainer.addEventListener('mouseover', clearInterval(timer));
            swiperContainer.addEventListener('mouseover', () => clearInterval(timer));
            swiperContainer.addEventListener('mouseout', () => {
                this._nextArrow();
                timer = setInterval(() => this._nextArrow(), this.state.loopTime)
            });
        }
        if (this.navigation.prevEl) {
            $(`.${this.navigation.prevEl}`).addEventListener('click', () => this._prevArrow());
        }
        if (this.navigation.nextEl) {
            $(`.${this.navigation.nextEl}`).addEventListener('click', () => this._nextArrow());
        }
        if (!this.pagination.elClassParent) {
            return
        }
        let swiperPagination = $(`.${this.pagination.elClassParent}`);
        this._onEventListener(swiperPagination, 'click', this.pagination.elClassChild, (e) => {
            let index = Number(e.target.dataset.index);
            let defaultLength = this.state.defaultLength;
            let currentIndex = Number($(`.${this.pagination.elClassChild}.${this.pagination.elChildActive}`).dataset.index);
            if (currentIndex === defaultLength - 1 && index === 0) {
                index = defaultLength;
            }
            if (currentIndex === 0 && index === defaultLength - 1) {
                index = - 1;
            }
            this._goIndex(index);
        });
    };
    _autoPlay() {

    };
    _addHTML() {
        if (!this.pagination.elClassParent) {
            return
        }
        let $ = this._$;
        let swiperItem = $(`#${this.state.elIdParent}`).children;
        let swiperPagination = $(`.${this.pagination.elClassParent}`);
        for (let i = 0; i < swiperItem.length; i++) {
            let swiperPaginationSwitch = this._createElement('span');
            swiperPaginationSwitch.setAttribute('class', this.pagination.elClassChild);
            swiperPaginationSwitch.setAttribute('data-index', i);
            this._appendChild(swiperPagination, swiperPaginationSwitch);
        }
    };
    _clone() {
        let $ = this._$;
        let swiperList = $(`#${this.state.elIdParent}`);
        let swiperItem = document.getElementsByClassName(this.state.elClassChild);
        let containerWidth = swiperList.parentNode.offsetWidth;
        let swiperItemWidth = swiperItem[0].offsetWidth;
        let cloneNum = parseInt(containerWidth / swiperItemWidth);
        let swiperItemClone = [];
        for(let i = 0; i< swiperItem.length; i++){
            swiperItemClone.push(swiperItem[i].outerHTML);
        }
        
        //let firstSwiperItem = swiperItem[0].cloneNode(true);
        //let lastSwiperItem = swiperItem[swiperItem.length - 1].cloneNode(true);
        let index = this.state.index;
        if (this.pagination.elClassParent) {
            let swiperSwitch = document.getElementsByClassName(this.pagination.elClassChild);
            let swiperSwitchActive = swiperSwitch[index];
            swiperSwitchActive.classList.add(this.pagination.elChildActive);
        };
        this.state.defaultLength = swiperItem.length;
        this.state.itemWidth = swiperItemWidth;
        this.state.translateX = - swiperItemWidth * (index + cloneNum);
        swiperList.style.transform = `translateX(${this.state.translateX}px)`;
       //添加到DOM节点 
        swiperList.insertAdjacentHTML('afterbegin',swiperItemClone.slice(1).join(''));
        swiperList.insertAdjacentHTML('beforeend',swiperItemClone.slice(0,this.state.defaultLength - 1).join(''));
        //swiperList.appendChild(firstSwiperItem);
        // swiperList.prepend(lastSwiperItem);
        
        this._goIndex(index);
    };
    _highLight(index) {
        let swiperSwitch = document.getElementsByClassName(this.pagination.elClassChild);
        [].forEach.call(swiperSwitch, swiperSwitch => swiperSwitch.classList.remove(this.pagination.elChildActive));
        let swiperSwitchActive = swiperSwitch[index];
        swiperSwitchActive.classList.add(`${this.pagination.elChildActive}`);
    };

    _goIndex(index) {
        let $ = this._$;
        let swiperList = $(`#${this.state.elIdParent}`);
        let swiperItem = document.getElementsByClassName(this.state.elClassChild);
        let containerWidth = swiperList.parentNode.offsetWidth;
        let swiperItemWidth = swiperItem[0].offsetWidth;
        let cloneNum = parseInt(containerWidth / swiperItemWidth);
        let duration = this.state.duration;
        let beginTranslateX = this.state.translateX;
        let itemWidth = this.state.itemWidth;
        let defaultLength = this.state.defaultLength;
        let endTranslateX = - itemWidth * (index + cloneNum);
        if (this.state.isLock) {
            return
        }
        this.state.isLock = true;

        this._animateTo(beginTranslateX, endTranslateX, duration, function (value) {
            swiperList.style.transform = `translateX(${value}px)`;
        }, value => {
            if (index === -1) {
                index = defaultLength - 1;
                value = - itemWidth * (index + cloneNum);
            }
            if (index === defaultLength) {
                index = 0;
                value = - itemWidth * (index + cloneNum);
            }
            swiperList.style.transform = `translateX(${value}px)`;
            this.state.isLock = false;
            this.state.index = index;
            this.state.translateX = value;
            if (this.pagination.elClassParent) {
                this._highLight(index);
            }
        })
    };
    _nextArrow() {
        let index = this.state.index;
        this._goIndex(index + 1);
    };
    _prevArrow() {
        let index = this.state.index;
        this._goIndex(index - 1);
    };
    _linear(begin, end, time, duration) {
        return (end - begin) / duration * time + begin;
    };
    _animateTo(begin, end, duration, changeCallback, finishCallback) {
        var that = this;
        let startTime = Date.now();
        requestAnimationFrame(function update() {
            let currentTime = Date.now();
            let time = currentTime - startTime;
            let value = that._linear(begin, end, time, duration);
            typeof changeCallback === 'function' && changeCallback(value);
            if (startTime + duration > currentTime) {
                requestAnimationFrame(update);
            } else {
                typeof finishCallback === 'function' && finishCallback(end);
            }
        });
    };

}
const PAGE = {
    data: {
        swiper1: null,
    },
    init: function () {
        this.swiper();
    },
    swiper: function () {
        PAGE.data.swiper1 = new Swiper({
            swiper: {
                elIdParent: 'swiper-list',
                elClassChild: 'swiper-slide',
            },
            duration: 500,
            pagination: {
                elClassParent: 'swiper-pagination',
                elClassChild: 'swiper-pagination-switch',
                elChildActiveClass: 'active',
            },
            navigation: {
                nextEl: 'swiper-button-next',
                prevEl: 'swiper-button-prev',
            },
            loop: false,
            loopTime: 1500,
        });
    }
}
PAGE.init();