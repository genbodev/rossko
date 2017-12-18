var calendar = calendar || {};

/**
 * Name days of the week
 * @type {string[]}
 */
calendar.days = [
    'Понедельник',
    'Вторник',
    'Среда',
    'Четверг',
    'Пятница',
    'Суббота',
    'Воскресенье'
];

/**
 * Name of months
 * @type {string[]}
 */
calendar.months = [
    'Январь',
    'Февраль',
    'Март',
    'Апрель',
    'Май',
    'Июнь',
    'Июль',
    'Август',
    'Сентябрь',
    'Октябрь',
    'Ноябрь',
    'Декабрь'
];

/**
 * Stores all generated dates
 * Just in case :)
 * @type {{}}
 */
calendar.dates = {};

/**
 * Object with the selected period
 * @type {null}
 */
calendar.selectedDate = null;

/**
 * Stores the object with the selected day
 * @type {null}
 */
calendar.selectedDay = null;

/**
 * Initializing DOM Events
 */
calendar.init = function () {

    var calendarContainer = $('#calendar-container');

    // Find today
    $('#return-button').click(function () {
        calendar.hideForms();
        calendar.selectedDay = null;
        var date = new Date();
        calendar.create('calendar-container', date.getFullYear(), date.getMonth() + 1);
        calendar.eventsInsert();
    });

    // Update button
    $('#update-btn').click(function () {
        calendar.hideForms();
        calendar.selectedDay = null;
        var date = calendar.selectedDate;
        calendar.create('calendar-container', date.getFullYear(), date.getMonth() + 1);
        calendar.eventsInsert();
    });

    // Switch to the previous month
    $('#prev-button').click(function () {
        calendar.selectedDay = null;
        calendar.hideForms();
        var date = calendar.selectedDate;
        date.setMonth(date.getMonth() - 1);
        calendar.create('calendar-container', date.getFullYear(), date.getMonth() + 1);
        calendar.eventsInsert();
    });

    // Switch to the next month
    $('#next-button').click(function () {
        calendar.selectedDay = null;
        calendar.hideForms();
        var date = calendar.selectedDate;
        date.setMonth(date.getMonth() + 1);
        calendar.create('calendar-container', date.getFullYear(), date.getMonth() + 1);
        calendar.eventsInsert();
    });

    // Will show the visually selected day
    calendarContainer.on('click', '.card', function () {
        calendar.selectDay(this);
        calendar.showEventFullForm(this);
    });

    var addBtn = $('#add-btn');

    addBtn.popover({
        placement: 'bottom',
        content: calendar.getEventForm(),
        html: true
    });

    // Highlight the day for which the event is intended
    // The default is the current date
    addBtn.click(function () {
        calendar.hideEventFullForm();
        calendar.hideFoundForm();
        if (calendar.selectedDay === null) {
            var card = calendarContainer.find('div.my-current-day');
            if (card.length) {
                calendar.selectDay(card);
                addBtn.popover('show');
            }
            else {
                var date = new Date;
                calendar.selectedDay = date.getFullYear() + '-' + date.getMonth() + '-' + date.getDate();
                addBtn.popover('show');
            }
        }
    });

    var searchInput = $('#search-input');

    searchInput.popover({
        placement: 'bottom',
        html: true
    });

    searchInput.click(function () {
        calendar.hideForms();
        searchInput.popover('show');
    });

    var popover = searchInput.data('bs.popover');

    // Search
    searchInput.keyup(function () {
        calendar.hideForms();
        var foundObj = {};
        var searchText = $(this).val().toLowerCase();
        var events = JSON.parse(localStorage.getItem('events'));
        if (events !== null && searchText !== '') {
            var lsDate, cardEventName, cardEventDescription, cardEventMembers, cardEventDate;
            for (lsDate in events) {
                if (events.hasOwnProperty(lsDate)) {
                    cardEventName = events[lsDate].eventName;
                    if (cardEventName.indexOf(searchText) !== -1) {
                        foundObj[lsDate] = events[lsDate];
                    }
                    cardEventDescription = events[lsDate].eventDescription;
                    if (cardEventDescription.indexOf(searchText) !== -1) {
                        foundObj[lsDate] = events[lsDate];
                    }
                    cardEventMembers = events[lsDate].eventMembers;
                    if (cardEventMembers.indexOf(searchText) !== -1) {
                        foundObj[lsDate] = events[lsDate];
                    }
                    cardEventDate = events[lsDate].eventDate;
                    if (cardEventDate.indexOf(searchText) !== -1) {
                        foundObj[lsDate] = events[lsDate];
                    }
                }
            }

            if ($.isEmptyObject(foundObj) === false) {
                calendar.hideFoundForm();
                popover.config.content = calendar.getFoundForm(foundObj);
                searchInput.popover('show');
            }

        } else {
            popover.config.content = '';
            calendar.hideFoundForm();
        }
    });

};

/**
 * Creates a calendar
 * @param id
 * @param year
 * @param month
 */
calendar.create = function (id, year, month) {
    var calendarElem = $('#' + id);
    calendarElem.empty();
    month = month - 1;
    var date = new Date(year, month);
    var dayWeek = calendar.getDay(date);

    var currentDate = new Date();

    var i, j, row, col, card, wrapper, cardHeader, cardBody, cardEventName, cardEventDescription, cardEventMembers,
        cardEventDate;
    var headerText, obj = {};
    var rows = 5, cols = 7;
    for (i = 0; i < rows; i++) {
        row = $('<div />', {'class': 'row'});
        col = $('<div />', {'class': 'col-12 d-flex my-line-wrapper'});
        if (i === 0) {
            col.addClass('my-first-line-wrapper');
        }
        if (i === rows - 1) {
            col.addClass('my-last-line-wrapper');
        }
        for (j = 0; j < cols; j++) {

            obj = this.getDateObj(i, j, dayWeek, date);
            calendar.dates[obj['fullYear'] + '-' + obj['month'] + '-' + obj['date']] = obj;

            card = $('<div />', {'class': 'card'});
            if (currentDate.getFullYear() === obj['fullYear'] &&
                currentDate.getMonth() === obj['month'] &&
                currentDate.getDate() === obj['date']) {
                card.addClass('my-current-day my-card-body-wrapper-selected');
            }
            card.data('date', obj['fullYear'] + '-' + obj['month'] + '-' + obj['date']);
            col.append(card);

            wrapper = $('<div />', {'class': 'my-card-body-wrapper'});
            card.append(wrapper);

            headerText = this.getHeaderText(i, j, obj);
            cardHeader = $('<div />', {'class': 'card-header', text: headerText});

            cardBody = $('<div />', {'class': 'card-body'});
            wrapper.append(cardHeader, cardBody);

            cardEventName = $('<h4 />', {'class': 'card-title', text: ''});
            cardEventDescription = $('<p />', {'class': 'card-text', text: ''});
            cardEventMembers = $('<div />', {'class': 'card-footer text-muted', text: ''});
            cardEventDate = $('<div />', {'class': 'card-footer text-muted my-card-footer-date', text: ''});

            cardBody.append(cardEventName, cardEventDescription, cardEventMembers, cardEventDate);

            dayWeek = dayWeek - 1;
        }
        row.append(col);
        calendarElem.append(row);
    }

    calendar.selectedDate = date;
    calendar.updateSelectedDate();

};

/**
 * Returns the formatted header (For example, 'Понедельник, 1' or '28')
 * @param line
 * @param col
 * @param dateObj
 * @returns {string}
 */
calendar.getHeaderText = function (line, col, dateObj) {
    var headerText = (line === 0) ? calendar.days[col] + ', ' : '';
    headerText = headerText + dateObj['date'];
    return headerText;
};

/**
 * Returns an object (For example, {fullYear: 2017, month: 0, date: 1})
 * @param i
 * @param j
 * @param dayWeek
 * @param date
 * @returns {{}}
 */
calendar.getDateObj = function (i, j, dayWeek, date) {
    var obj = {};
    var d = new Date(date.getFullYear(), date.getMonth(), 1);
    d.setDate(d.getDate() - ((dayWeek) ? dayWeek : 0));
    obj['fullYear'] = d.getFullYear();
    obj['month'] = d.getMonth();
    obj['date'] = d.getDate();
    return obj;

};

/**
 * Returns the position of the day in a week
 * @param date
 * @returns {number}
 */
calendar.getDay = function (date) {
    var day = date.getDay();
    if (day === 0) {
        day = 7;
    }
    return day - 1;
};

/**
 * Inserts/updates events in DOM
 */
calendar.eventsInsert = function () {
    var events = JSON.parse(localStorage.getItem('events'));
    var cards = $('#calendar-container').find('div.card');
    var cardDate, lsDate, cardEventName, cardEventDescription, cardEventMembers, cardEventDate;
    for (var i = 0; i < cards.length; i++) {
        cardDate = $(cards[i]).data('date');
        for (lsDate in events) {
            if (events.hasOwnProperty(lsDate)) {
                if (lsDate === cardDate) {
                    cardEventName = $(cards[i]).find('h4.card-title');
                    cardEventDescription = $(cards[i]).find('p.card-text');
                    cardEventMembers = $(cards[i]).find('div.card-footer');
                    cardEventDate = $(cards[i]).find('div.card-footer.my-card-footer-date');
                    cardEventName.text(events[lsDate].eventName);
                    cardEventDescription.text(events[lsDate].eventDescription);
                    cardEventMembers.text(events[lsDate].eventMembers);
                    cardEventDate.text(events[lsDate].eventDate);
                }
            }
        }
    }
};

/**
 * Visualization of the selected day
 * @param cardElement
 */
calendar.selectDay = function (cardElement) {
    var calendarContainer = $('#calendar-container');
    var cardBodyWrapper = calendarContainer.find('div.my-card-body-wrapper.my-card-body-wrapper-selected');
    cardBodyWrapper.removeClass('my-card-body-wrapper-selected');
    calendar.hideForms();
    if (cardElement) {
        cardBodyWrapper = $(cardElement).find('.my-card-body-wrapper');
    }
    cardBodyWrapper.css({width: '100%', height: '100%'});
    var wrapperWidth = cardBodyWrapper.width();
    var wrapperHeight = cardBodyWrapper.height();
    cardBodyWrapper.width(wrapperWidth - 2 + 'px');
    cardBodyWrapper.height(wrapperHeight - 2 + 'px');
    cardBodyWrapper.addClass('my-card-body-wrapper-selected');
    calendar.selectedDay = $(cardElement).data('date');

};

/**
 * Updates the date in DOM
 */
calendar.updateSelectedDate = function () {
    var date = calendar.selectedDate;
    $('#selected-date').text(calendar.months[date.getMonth()] + ', ' + date.getFullYear());
};

/**
 * Prepare and return a form to add an event
 * @returns {jQuery|HTMLElement}
 */
calendar.getEventForm = function () {
    var wrapper = $('<div />', {'class': 'my-add-event-form'});
    var iconDiv = $('<div />', {css: {'text-align': 'right'}});
    wrapper.append(iconDiv);
    var icon = $('<i />', {'class': 'fa fa-times my-add-event-form-button-close'});
    iconDiv.append(icon);
    var inputDiv = $('<div />');
    wrapper.append(inputDiv);
    var input = $('<input />', {'class': 'form-control form-control-sm', type: 'text', placeholder: 'Название'});
    inputDiv.append(input);
    var buttonDiv = $('<div />');
    wrapper.append(buttonDiv);
    var button = $('<button />', {'class': 'btn btn-light btn-sm', text: 'Создать'});
    buttonDiv.append(button);

    // Close form
    icon.click(function () {
        calendar.hideEventForm();
    });

    // Add event
    button.click(function () {
        if ($(input).val() === '') {
            return;
        }
        var calendarContainer = $('#calendar-container');
        var cardBodyWrapper = calendarContainer.find('div.my-card-body-wrapper.my-card-body-wrapper-selected');
        var inputValue = $(input).val();
        var card = cardBodyWrapper.parent();
        $(card).popover({
            placement: 'right',
            content: calendar.getEventFullForm(card, {eventName: inputValue}),
            html: true
        });
        $(card).popover('show');
        calendar.hideEventForm();

        var events = JSON.parse(localStorage.getItem('events'));
        // LocalStorage first init
        if (events === null) {
            events = {};
        }
        events[calendar.selectedDay] = {
            eventName: $(input).val(),
            eventDate: '',
            eventMembers: '',
            eventDescription: ''
        };
        localStorage.setItem('events', JSON.stringify(events));
        calendar.eventsInsert();
    });

    return wrapper;

};

/**
 * Hide event form
 */
calendar.hideEventForm = function () {
    $('#add-btn').popover('hide');
};

/**
 * Prepares and returns the form to complement the event
 * @param cardElement
 * @param cardData
 * @returns {jQuery|HTMLElement}
 */
calendar.getEventFullForm = function (cardElement, cardData) {

    cardData = cardData || {};
    cardData.eventName = cardData.eventName || '';
    cardData.eventDate = cardData.eventDate || '';
    cardData.eventMembers = cardData.eventMembers || '';
    cardData.eventDescription = cardData.eventDescription || '';

    var wrapper = $('<div />', {'class': 'my-add-event-form'});
    var iconDiv = $('<div />', {css: {'text-align': 'right'}});
    wrapper.append(iconDiv);
    var icon = $('<i />', {'class': 'fa fa-times my-add-event-form-button-close'});
    iconDiv.append(icon);
    var inputEventDiv = $('<div />');
    wrapper.append(inputEventDiv);
    var inputEvent = $('<input />', {'class': 'form-control form-control-sm', type: 'text', placeholder: 'Событие'});
    inputEvent.val(cardData.eventName);
    inputEventDiv.append(inputEvent);
    var inputDateDiv = $('<div />');
    wrapper.append(inputDateDiv);
    var inputDate = $('<input />', {
        'class': 'form-control form-control-sm',
        type: 'text',
        placeholder: 'День, месяц, год'
    });
    inputDate.val(cardData.eventDate);
    inputDateDiv.append(inputDate);
    var inputMembersDiv = $('<div />');
    wrapper.append(inputMembersDiv);
    var inputMembers = $('<input />', {
        'class': 'form-control form-control-sm',
        type: 'text',
        placeholder: 'Имена участников'
    });
    inputMembers.val(cardData.eventMembers);
    inputMembersDiv.append(inputMembers);
    var descriptionDiv = $('<div />');
    wrapper.append(descriptionDiv);
    var description = $('<textarea />', {
        'class': 'form-control',
        placeholder: 'Описание',
        css: {resize: 'none', 'margin-top': '30px', height: '170px'}
    });
    description.val(cardData.eventDescription);
    descriptionDiv.append(description);
    var buttonDiv = $('<div />');
    wrapper.append(buttonDiv);
    var buttonApply = $('<button />', {'class': 'btn btn-light btn-sm', text: 'Готово', css: {'margin-right': '10px'}});
    buttonDiv.append(buttonApply);
    var buttonDelete = $('<button />', {'class': 'btn btn-light btn-sm', text: 'Удалить'});
    buttonDiv.append(buttonDelete);

    // Close form
    icon.click(function () {
        $(cardElement).popover('dispose');
    });

    // Update event
    buttonApply.click(function () {
        var events = JSON.parse(localStorage.getItem('events'));
        // LocalStorage first init
        if (events === null) {
            events = {};
        }
        events[calendar.selectedDay] = {
            eventName: $(inputEvent).val(),
            eventDate: $(inputDate).val(),
            eventMembers: $(inputMembers).val(),
            eventDescription: $(description).val()
        };
        localStorage.setItem('events', JSON.stringify(events));
        calendar.eventsInsert();
        $(cardElement).popover('dispose');
    });

    // Delete event
    buttonDelete.click(function () {
        var cardDate = $(cardElement).data('date');
        var events = JSON.parse(localStorage.getItem('events'));
        events[cardDate].eventName = '';
        events[cardDate].eventDate = '';
        events[cardDate].eventMembers = '';
        events[cardDate].eventDescription = '';
        localStorage.setItem('events', JSON.stringify(events));
        calendar.eventsInsert();
        $(cardElement).popover('dispose');
    });

    return wrapper;
};

/**
 * Hides the complete form for event completion
 */
calendar.hideEventFullForm = function () {
    var calendarContainer = $('#calendar-container');
    var cards = calendarContainer.find('div.card');
    cards.each(function (index, element) {
        $(element).popover('dispose');
    });
};

/**
 * Show full form
 * @param card
 */
calendar.showEventFullForm = function(card) {
    var cardDate = $(card).data('date');
    var events = JSON.parse(localStorage.getItem('events'));
    var cardEventName = '', cardEventDescription = '', cardEventMembers = '', cardEventDate = '';
    if (events !== null) {
        var lsDate;
        for (lsDate in events) {
            if (events.hasOwnProperty(lsDate)) {
                if (cardDate === lsDate) {
                    cardEventName = events[lsDate].eventName;
                    cardEventDescription = events[lsDate].eventDescription;
                    cardEventMembers = events[lsDate].eventMembers;
                    cardEventDate = events[lsDate].eventDate;
                }
            }
        }
    }
        $(card).popover({
            placement: 'right',
            html: true,
            content: calendar.getEventFullForm(card, {
                eventName: cardEventName,
                eventDescription: cardEventDescription,
                eventMembers: cardEventMembers,
                eventDate: cardEventDate
            })
        });
        $(card).popover('show');

};

/**
 * Prepare and return found occurrences
 */
calendar.getFoundForm = function (foundObj) {
    var wrapper = $('<div />', {'class': 'my-add-event-form my-add-event-form-found'});
    var iconDiv = $('<div />', {css: {'text-align': 'right'}});
    wrapper.append(iconDiv);
    var icon = $('<i />', {'class': 'fa fa-times my-add-event-form-button-close'});
    iconDiv.append(icon);
    var foundWrapper = $('<div />', {'class': 'my-founds-wrapper'});
    wrapper.append(foundWrapper);
    var foundDiv, foundDivEventName, foundDivEventDate;
    for (var date in foundObj) {
        if (foundObj.hasOwnProperty(date)) {
            foundDiv = $('<div />', {'class': 'my-found-wrapper'});
            foundDiv.data('date', date);
            foundDivEventName = $('<div />', {text: foundObj[date].eventName});
            foundDivEventDate = $('<div />', {text: foundObj[date].eventDate});
            foundDiv.append(foundDivEventName, foundDivEventDate);
            foundWrapper.append(foundDiv);
        }
    }

    // Close form
    icon.click(function () {
        calendar.hideFoundForm();
    });

    // Open the form for editing
    foundWrapper.on('click', '.my-found-wrapper', function () {
        var data = $(this).data('date');
        var dateArr = data.split('-');
        calendar.create('calendar-container', dateArr[0], parseInt(dateArr[1]) + 1);
        calendar.eventsInsert();
        var cards = $('#calendar-container').find('div.card');
        var cardDate;
        for (var i = 0; i < cards.length; i++) {
            cardDate = $(cards[i]).data('date');
            if (data === cardDate) {
                calendar.selectDay(cards[i]);
                calendar.showEventFullForm(cards[i]);
            }
        }
    });

    return wrapper;
};

/**
 * Hide found-form
 */
calendar.hideFoundForm = function () {
    $('#search-input').popover('hide');
};

/**
 * Hide all forms/popovers
 */
calendar.hideForms = function () {
    this.hideEventForm();
    this.hideEventFullForm();
    this.hideFoundForm();
};

$(document).ready(function () {

    var panelContainer = $('#panel-container');
    var calendarContainer = $('#calendar-container');
    var controlContainer = $('#control-container');

    $(window).resize(function () {
        if (document.documentElement.clientWidth < 992) {
            panelContainer.removeClass('container');
            panelContainer.addClass('container-fluid');
            calendarContainer.removeClass('container');
            calendarContainer.addClass('container-fluid');
            controlContainer.removeClass('container');
            controlContainer.addClass('container-fluid');
        } else {
            panelContainer.removeClass('container-fluid');
            panelContainer.addClass('container');
            calendarContainer.removeClass('container-fluid');
            calendarContainer.addClass('container');
            controlContainer.removeClass('container-fluid');
            controlContainer.addClass('container');
        }

        calendar.selectDay();

    });

    calendar.init();

    var now = new Date();
    calendar.create('calendar-container', now.getFullYear(), now.getMonth() + 1);

    calendar.eventsInsert();
});