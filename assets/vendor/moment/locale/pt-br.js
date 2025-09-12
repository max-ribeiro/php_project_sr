//! moment.js locale configuration
//! locale : Portuguese (Brazil) [pt-br]
//! author : Caio Ribeiro Pereira : https://github.com/caio-ribeiro-pereira

;(function (global, factory) {
   typeof exports === 'object' && typeof module !== 'undefined'
       && typeof require === 'function' ? factory(require('moment')) :
   typeof define === 'function' && define.amd ? define(['moment'], factory) :
   factory(global.moment)
}(this, (function (moment) { 'use strict';


var ptBr = moment.defineLocale('pt-br', {
    months : 'Janeiro_Fevereiro_Mar\u00E7o_Abril_Maio_Junho_Julho_Agosto_Setembro_Outubro_Novembro_Dezembro'.split('_'),
    monthsShort : 'Jan_Fev_Mar_Abr_Mai_Jun_Jul_Ago_Set_Out_Nov_Dez'.split('_'),
    weekdays : 'Domingo_Segunda-feira_Ter\u00E7a-feira_Quarta-feira_Quinta-feira_Sexta-feira_S\u00E1bado'.split('_'),
    weekdaysShort : 'Dom_Seg_Ter_Qua_Qui_Sex_S\u00E1b'.split('_'),
    weekdaysMin : 'Do_2\u00AA_3\u00AA_4\u00AA_5\u00AA_6\u00AA_S\u00E1'.split('_'),
    weekdaysParseExact : true,
    longDateFormat : {
        LT : 'HH:mm',
        LTS : 'HH:mm:ss',
        L : 'DD/MM/YYYY',
        LL : 'D [de] MMMM [de] YYYY',
        LLL : 'D [de] MMMM [de] YYYY [\u00E0s] HH:mm',
        LLLL : 'dddd, D [de] MMMM [de] YYYY [\u00E0s] HH:mm'
    },
    calendar : {
        sameDay: '[Hoje \u00E0s] LT',
        nextDay: '[Amanh\u00E3 \u00E0s] LT',
        nextWeek: 'dddd [\u00E0s] LT',
        lastDay: '[Ontem \u00E0s] LT',
        lastWeek: function () {
            return (this.day() === 0 || this.day() === 6) ?
                '[\u00DAltimo] dddd [\u00E0s] LT' : // Saturday + Sunday
                '[\u00DAltima] dddd [\u00E0s] LT'; // Monday - Friday
        },
        sameElse: 'L'
    },
    relativeTime : {
        future : 'em %s',
        past : '%s atr\u00E1s',
        s : 'poucos segundos',
        m : 'um minuto',
        mm : '%d minutos',
        h : 'uma hora',
        hh : '%d horas',
        d : 'um dia',
        dd : '%d dias',
        M : 'um m\u00EAs',
        MM : '%d meses',
        y : 'um ano',
        yy : '%d anos'
    },
    dayOfMonthOrdinalParse: /\d{1,2}\u00BA/,
    ordinal : '%d\u00BA'
});

return ptBr;

})));
