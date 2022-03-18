const state = {};

module.exports = {
    setState({ url, success }) {
        if (state[url]?.[success]) state[url][success] += 1;
        else {
            state[url] = {
                ...state[url],
                [success] : 1
            };
        }

        return state;
    }
};
