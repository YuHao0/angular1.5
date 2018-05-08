/*
 *
 * angular factory
 *
 * */

;(function (app) {

    var utils = {
        tips: function () {
            Messenger.options = {
                extraClasses: 'messenger-fixed messenger-on-top',
                theme: 'air'
            };
            var msg = Messenger(), action = {
                success: {
                    type: 'success',
                    hideAfter: 3
                },
                error: {
                    type: 'error',
                    showCloseButton: true
                }
            }, fn = {};
            angular.forEach(action, function (option, type) {
                fn[type] = function (message, hideAfter) {
                    hideAfter && (option.hideAfter = hideAfter);
                    option.message = message;
                    msg.post(option);
                }
            });
            return fn;
        },
        dealPage: function ($sce, $timeout) {
            return function (page, callback) {
                if (!page) return null;
                var calculate = function (a, b, c) {
                    c = c || (a > b ? a % b : 0);
                    return Math.max(1, (a - c) / b + (c ? 1 : 0))
                };
                return angular.extend([], angular.extend({
                    limit: 15,
                    total: 0,
                    split: 5,
                    index: page.page || 1,
                    selected: page.page || 1,
                    popover: false,
                    prevName: '上一页',
                    nextName: '下一页',
                    click: function (item) {
                        if (typeof item === 'object') {
                            if (item.index == this.index) return this;
                            if (item.prev || item.next) {
                                this.index += item.prev ? -1 : 1
                            } else if (item.first || item.last) {
                                this.index = item.first ? 1 : this.nums
                            } else {
                                this.index = item.index
                            }
                        } else if (/^[0-9]*$/.test(Math.abs(parseInt(item)))) {
                            if ((item = parseInt(item)) === this.index) return this;
                            this.index = item
                        } else {
                            return this
                        }
                        //this.page !==
                        (item = this.apply()).index && angular.forEach(this.callback, function (fn) {
                            fn instanceof Function && $timeout(function () {
                                angular.forEach('index|selected|page|limit|split'.split('|'), function (key) {
                                    item[key] = Math.max(parseInt(item[key] || 1), 1)
                                });
                                fn(item);
                            }, 10)
                        });
                        this.loading = item.index;
                        return this
                    },
                    apply: function () {
                        var context = this;
                        if (!this.nums) {
                            this.nums = calculate(this.total, this.limit);
                            this.rows = calculate(this.nums, this.split);
                            this.callback = this.callback ? (this.callback instanceof Array ? this.callback : [this.callback]) : [];
                            callback instanceof Array ? (this.callback = this.callback.concat(callback)) : (callback && this.callback.push(callback))
                        }
                        this.index = this.selected = this.page = Math.max(1, Math.min(this.index, this.nums));
                        this.row = Math.min(calculate(this.index, this.split), this.rows);
                        this.splice(0);
                        if (this.index > 1) {
                            this[0] = {
                                index: this.prevName,
                                selected: this.index - 1,
                                prev: true
                            };
                        }
                        if (this.row > 1) {
                            this[1] = {
                                index: '1...',
                                selected: 1,
                                first: true
                            }
                        }
                        for (var i = (this.row - 1) * this.split + 1; i <= Math.min(this.row * this.split, this.nums); i++) {
                            this[this.length] = {
                                index: i,
                                selected: i,
                                num: true,
                                active: this.index === i
                            }
                        }
                        if (this.row < this.rows) {
                            this[this.length] = {
                                index: '...' + this.nums,
                                selected: this.nums,
                                last: true
                            }
                        }
                        if (this.index < this.nums) {
                            this[this.length] = {
                                index: this.nextName,
                                selected: this.index + 1,
                                next: true
                            };
                        }
                        angular.forEach(context, function (item) {
                            item.index = $sce.trustAsHtml(item.index.toString());
                        });
                        return this
                    }
                }, page)).apply();
            }
        }
    };

    app.factory('tips', utils.tips);
    app.factory('pager', ['$sce', '$timeout', utils.dealPage]);
    /*page : {total: '',limit: '',page: '',pageSize: ''}*/
    app.directive('datetimepicker', ['$parse', '$q', '$timeout', '$ocLazyLoad', function ($parse, $q, $timeout, $ocLazyLoad) {
        return {
            restrict: 'A',
            require: '?ngModel',
            link: function (scope, element, attrs, ctrl) {
                $ocLazyLoad.load([
                    '../../lib/datetimepicker/datetimepicker.css',
                    '../../lib/datetimepicker/bootstrap-datetimepicker.min.js'
                ]).then(function () {
                    $.fn.datetimepicker.dates['zh-CN'] = {
                        days: ["星期日", "星期一", "星期二", "星期三", "星期四", "星期五", "星期六", "星期日"],
                        daysShort: ["周日", "周一", "周二", "周三", "周四", "周五", "周六", "周日"],
                        daysMin: ["日", "一", "二", "三", "四", "五", "六", "日"],
                        months: ["一月", "二月", "三月", "四月", "五月", "六月", "七月", "八月", "九月", "十月", "十一月", "十二月"],
                        monthsShort: ["一月", "二月", "三月", "四月", "五月", "六月", "七月", "八月", "九月", "十月", "十一月", "十二月"],
                        today: "今天",
                        suffix: [],
                        meridiem: ["上午", "下午"]
                    };
                    // get component element
                    var datetimepicker = $(element).datetimepicker({
                            autoclose: true,
                            format: element.attr('data-format') || 'yyyy-mm-dd HH:ii:00',
                            language: 'zh-CN',
                            pickerPosition: 'bottom-right',
                            minView: attrs.minview || 0,
                            viewSelect: 'year'
                        }),
                        picker = datetimepicker.data('datetimepicker').picker;

                    // datetimepicker.on('changeDate', function () {
                    //     scope.testTime(datetimepicker);
                    // });
                    // replace the arrow icon
                    picker.find('.icon-arrow-left').replaceWith('<i class="dsb-font dsb-left"></i>');
                    picker.find('.icon-arrow-right').replaceWith('<i class="dsb-font dsb-right"></i>');
                })
            }
        }
    }]);
    app.directive('pagination', ['$compile', '$timeout', function ($compile, $timeout) {
        return {
            restrict: 'A',
            require: '?ngModel',
            template: function (element, attrs) {
                if (attrs.pagination) {
                    var dom = [], model = attrs.pagination,
                        _event = [];
                    _event.push(model + '.limit!==' + model + '.pageSize');
                    _event.push('&&(' + model + '.limit=' + model + '.pageSize)');
                    _event.push('&&' + model + '.click(-1)');
                    dom.push('<ul ng-show="' + model + '.total">');
                    dom.push('<li ng-repeat="page in ' + model + '" ng-class="{true:\' active\'}[page.active]" ng-click="' + model + '.click(page)">');
                    dom.push('<a href="javascript:void(0)" ng-bind-html="page.index"></a>');
                    dom.push('</li>');
                    dom.push('<li ng-show="' + model + '.total">');
                    dom.push('<span class="click-popover">');
                    dom.push('<div ng-show="' + model + '.popover" class="input-append"><input type="text" ng-keydown="$event.keyCode===13&&' + _event.join('') + '" ng-model="' + model + '.pageSize"/><a href="javascript:void(0)" ng-click="' + _event.join('') + '"><i class="dsb-font dsb-ok"></i></a></div>');
                    dom.push('每页<b class="text-info" ng-bind="' + model + '.limit"></b> ');
                    dom.push('<a href="javascript:void(0)" ng-click="' + model + '.popover=true;' + model + '.pageSize=' + model + '.limit"><i class="dsb-font dsb-gear"></i></a>');
                    dom.push('</span>');
                    dom.push('</li>');
                    dom.push('<li ng-if="' + model + '.total" class="total-count"><span>总计<b class="text-info" ng-bind="' + model + '.total"></b></span></li>');
                    dom.push('</ul>');
                    dom.push('<span ng-if="' + model + '.rows>1" class="jump-page"><input type="text" class="input-small text-right" ng-keydown="$event.keyCode===13&&' + model + '.click(' + model + '.selected)" ng-model="' + model + '.selected"/>');
                    dom.push('<a ng-if="' + model + '.rows>1" href="javascript:void(0)" ng-click="' + model + '.click(' + model + '.selected)"><i class="dsb-font dsb-right"></i></a>');
                    dom.push('</span>');
                    element.addClass('pagination').html(dom.join(''));
                }
            },
            link: function (scope, element, attrs) {
                if (attrs.pagination) {
                    var model = attrs.pagination,
                        popoverHide = function () {
                            if (scope[model]) {
                                scope[model]['popover'] = false;
                                scope.$apply(scope[model]['popover']);
                            }
                        };
                    $(".click-popover").click(function (event) {
                        event.stopPropagation();
                    });
                    $(document).click(popoverHide);
                }
            }
        }
    }]);
    app.directive('table', ['$compile', '$timeout', function ($compile, $timeout) {
        return {
            restrict: 'E',
            require: '?ngModel',
            link: function (scope, element, attrs) {
                var target = '', dvCompute = $('#dvCompute');

                function Compute(v) {
                    dvCompute.html(v);
                    dvCompute.css('font-size', 14);
                    return dvCompute.width() + 15;
                }

                element.off().on('mouseover', function (e) {
                    target = e.target;
                    if (target.nodeName == 'TD' && Compute(target.innerHTML) > target.offsetWidth && !~target.innerHTML.indexOf('<a')) {

                        dvCompute.css({
                            'top': e.pageY,
                            'left': e.pageX,
                            'font-size': 12
                        });

                    } else {
                        dvCompute.css('top', 10000);
                    }
                });
            }
        }
    }]);
})(angular.module('app'));

/* ========================================================================
 * Bootstrap: modal.js v3.3.7
 * http://getbootstrap.com/javascript/#modals
 * ========================================================================
 * Copyright 2011-2016 Twitter, Inc.
 * Licensed under MIT (https://github.com/twbs/bootstrap/blob/master/LICENSE)
 * ======================================================================== */

+function ($) {
    'use strict';

    // MODAL CLASS DEFINITION
    // ======================

    var Modal = function (element, options) {
        this.options = options
        this.$body = $(document.body)
        this.$element = $(element)
        this.$dialog = this.$element.find('.modal-dialog')
        this.$backdrop = null
        this.isShown = null
        this.originalBodyPad = null
        this.scrollbarWidth = 0
        this.ignoreBackdropClick = false

        if (this.options.remote) {
            this.$element
                .find('.modal-content')
                .load(this.options.remote, $.proxy(function () {
                    this.$element.trigger('loaded.bs.modal')
                }, this))
        }
    }

    Modal.VERSION = '3.3.7'

    Modal.TRANSITION_DURATION = 300
    Modal.BACKDROP_TRANSITION_DURATION = 150

    Modal.DEFAULTS = {
        backdrop: true,
        keyboard: true,
        show: true
    }

    Modal.prototype.toggle = function (_relatedTarget) {
        return this.isShown ? this.hide() : this.show(_relatedTarget)
    }

    Modal.prototype.show = function (_relatedTarget) {
        var that = this
        var e = $.Event('show.bs.modal', {relatedTarget: _relatedTarget})

        this.$element.trigger(e)

        if (this.isShown || e.isDefaultPrevented()) return

        this.isShown = true

        this.checkScrollbar()
        this.setScrollbar()
        this.$body.addClass('modal-open')

        this.escape()
        this.resize()

        this.$element.on('click.dismiss.bs.modal', '[data-dismiss="modal"]', $.proxy(this.hide, this))

        this.$dialog.on('mousedown.dismiss.bs.modal', function () {
            that.$element.one('mouseup.dismiss.bs.modal', function (e) {
                if ($(e.target).is(that.$element)) that.ignoreBackdropClick = true
            })
        })

        this.backdrop(function () {
            var transition = $.support.transition && that.$element.hasClass('fade')

            if (!that.$element.parent().length) {
                that.$element.appendTo(that.$body) // don't move modals dom position
            }

            that.$element
                .show()
                .scrollTop(0)

            that.adjustDialog()

            if (transition) {
                that.$element[0].offsetWidth // force reflow
            }

            that.$element.addClass('in')

            that.enforceFocus()

            var e = $.Event('shown.bs.modal', {relatedTarget: _relatedTarget})

            transition ?
                that.$dialog // wait for modal to slide in
                    .one('bsTransitionEnd', function () {
                        that.$element.trigger('focus').trigger(e)
                    })
                    .emulateTransitionEnd(Modal.TRANSITION_DURATION) :
                that.$element.trigger('focus').trigger(e)
        })
    }

    Modal.prototype.hide = function (e) {
        if (e) e.preventDefault()

        e = $.Event('hide.bs.modal')

        this.$element.trigger(e)

        if (!this.isShown || e.isDefaultPrevented()) return

        this.isShown = false

        this.escape()
        this.resize()

        $(document).off('focusin.bs.modal')

        this.$element
            .removeClass('in')
            .off('click.dismiss.bs.modal')
            .off('mouseup.dismiss.bs.modal')

        this.$dialog.off('mousedown.dismiss.bs.modal')

        $.support.transition && this.$element.hasClass('fade') ?
            this.$element
                .one('bsTransitionEnd', $.proxy(this.hideModal, this))
                .emulateTransitionEnd(Modal.TRANSITION_DURATION) :
            this.hideModal()
    }

    Modal.prototype.enforceFocus = function () {
        $(document)
            .off('focusin.bs.modal') // guard against infinite focus loop
            .on('focusin.bs.modal', $.proxy(function (e) {
                if (document !== e.target &&
                    this.$element[0] !== e.target && !this.$element.has(e.target).length) {
                    this.$element.trigger('focus')
                }
            }, this))
    }

    Modal.prototype.escape = function () {
        if (this.isShown && this.options.keyboard) {
            this.$element.on('keydown.dismiss.bs.modal', $.proxy(function (e) {
                e.which == 27 && this.hide()
            }, this))
        } else if (!this.isShown) {
            this.$element.off('keydown.dismiss.bs.modal')
        }
    }

    Modal.prototype.resize = function () {
        if (this.isShown) {
            $(window).on('resize.bs.modal', $.proxy(this.handleUpdate, this))
        } else {
            $(window).off('resize.bs.modal')
        }
    }

    Modal.prototype.hideModal = function () {
        var that = this
        this.$element.hide()
        this.backdrop(function () {
            that.$body.removeClass('modal-open')
            that.resetAdjustments()
            that.resetScrollbar()
            that.$element.trigger('hidden.bs.modal')
        })
    }

    Modal.prototype.removeBackdrop = function () {
        this.$backdrop && this.$backdrop.remove()
        this.$backdrop = null
    }

    Modal.prototype.backdrop = function (callback) {
        var that = this
        var animate = this.$element.hasClass('fade') ? 'fade' : ''

        if (this.isShown && this.options.backdrop) {
            var doAnimate = $.support.transition && animate

            this.$backdrop = $(document.createElement('div'))
                .addClass('modal-backdrop ' + animate)
                .appendTo(this.$body)

            this.$element.on('click.dismiss.bs.modal', $.proxy(function (e) {
                if (this.ignoreBackdropClick) {
                    this.ignoreBackdropClick = false
                    return
                }
                if (e.target !== e.currentTarget) return
                this.options.backdrop == 'static'
                    ? this.$element[0].focus()
                    : this.hide()
            }, this))

            if (doAnimate) this.$backdrop[0].offsetWidth // force reflow

            this.$backdrop.addClass('in')

            if (!callback) return

            doAnimate ?
                this.$backdrop
                    .one('bsTransitionEnd', callback)
                    .emulateTransitionEnd(Modal.BACKDROP_TRANSITION_DURATION) :
                callback()

        } else if (!this.isShown && this.$backdrop) {
            this.$backdrop.removeClass('in')

            var callbackRemove = function () {
                that.removeBackdrop()
                callback && callback()
            }
            $.support.transition && this.$element.hasClass('fade') ?
                this.$backdrop
                    .one('bsTransitionEnd', callbackRemove)
                    .emulateTransitionEnd(Modal.BACKDROP_TRANSITION_DURATION) :
                callbackRemove()

        } else if (callback) {
            callback()
        }
    }

    // these following methods are used to handle overflowing modals

    Modal.prototype.handleUpdate = function () {
        this.adjustDialog()
    }

    Modal.prototype.adjustDialog = function () {
        var modalIsOverflowing = this.$element[0].scrollHeight > document.documentElement.clientHeight

        this.$element.css({
            paddingLeft: !this.bodyIsOverflowing && modalIsOverflowing ? this.scrollbarWidth : '',
            paddingRight: this.bodyIsOverflowing && !modalIsOverflowing ? this.scrollbarWidth : ''
        })
    }

    Modal.prototype.resetAdjustments = function () {
        this.$element.css({
            paddingLeft: '',
            paddingRight: ''
        })
    }

    Modal.prototype.checkScrollbar = function () {
        var fullWindowWidth = window.innerWidth
        if (!fullWindowWidth) { // workaround for missing window.innerWidth in IE8
            var documentElementRect = document.documentElement.getBoundingClientRect()
            fullWindowWidth = documentElementRect.right - Math.abs(documentElementRect.left)
        }
        this.bodyIsOverflowing = document.body.clientWidth < fullWindowWidth
        this.scrollbarWidth = this.measureScrollbar()
    }

    Modal.prototype.setScrollbar = function () {
        var bodyPad = parseInt((this.$body.css('padding-right') || 0), 10)
        this.originalBodyPad = document.body.style.paddingRight || ''
        if (this.bodyIsOverflowing) this.$body.css('padding-right', bodyPad + this.scrollbarWidth)
    }

    Modal.prototype.resetScrollbar = function () {
        this.$body.css('padding-right', this.originalBodyPad)
    }

    Modal.prototype.measureScrollbar = function () { // thx walsh
        var scrollDiv = document.createElement('div')
        scrollDiv.className = 'modal-scrollbar-measure'
        this.$body.append(scrollDiv)
        var scrollbarWidth = scrollDiv.offsetWidth - scrollDiv.clientWidth
        this.$body[0].removeChild(scrollDiv)
        return scrollbarWidth
    }

    // MODAL PLUGIN DEFINITION
    // =======================

    function Plugin(option, _relatedTarget) {
        return this.each(function () {
            var $this = $(this)
            var data = $this.data('bs.modal')
            var options = $.extend({}, Modal.DEFAULTS, $this.data(), typeof option == 'object' && option)

            if (!data) $this.data('bs.modal', (data = new Modal(this, options)))
            if (typeof option == 'string') data[option](_relatedTarget)
            else if (options.show) data.show(_relatedTarget)
        })
    }

    var old = $.fn.modal;

    $.fn.modal = Plugin;
    $.fn.modal.Constructor = Modal;

    // MODAL NO CONFLICT
    // =================
    $.fn.modal.noConflict = function () {
        $.fn.modal = old;
        return this
    };

    // MODAL DATA-API
    // ==============
    $(document).on('click.bs.modal.data-api', '[data-toggle="modal"]', function (e) {
        var $this = $(this);
        var href = $this.attr('href');
        var $target = $($this.attr('data-target') || (href && href.replace(/.*(?=#[^\s]+$)/, ''))); // strip for ie7
        var option = $target.data('bs.modal') ? 'toggle' : $.extend({}, $target.data(), $this.data());

        if ($this.is('a')) e.preventDefault();

        $target.one('show.bs.modal', function (showEvent) {
            if (showEvent.isDefaultPrevented()) return; // only register focus restorer if modal will actually get shown
            $target.one('hidden.bs.modal', function () {
                $this.is(':visible') && $this.trigger('focus')
            })
        });
        Plugin.call($target, option, this)
    })

}(jQuery);