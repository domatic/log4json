const _ = require('lodash');

const createDataOverlays = (items, config) => {
    const messages = [];
    const overlay = {};
    _.chain(items)
        .compact()
        .forEach((item) => {
            if (_.isObject(item)) {
                const result = item instanceof Error
                    ? { stack: item.stack }
                    : item;
                _.assignIn(overlay, result);
            } else {
                messages.push(item);
            }
        })
        .value();

    if (messages.length) {
        overlay.msg = messages.join(config.separator);
    }
    return overlay;
}
const formatter = (event, config) => {
    const output = {
        ts: event.startTime,
        level: event.level.levelStr,
    };

    if (event.categoryName !== 'default') {
        output.category = event.categoryName;
    }

    const messages = event.data;
    if (!_.isEmpty(messages)) {
        Object.assign(output, createDataOverlays(messages, config));
    }
    return output;
}

const jsonLayout = (config) => {
    config.separator = config.separator || ' ';
    return (event) => {
        const result = formatter(event, config);
        return JSON.stringify(result, null, config.space || 0);
    }
}

module.exports = jsonLayout;