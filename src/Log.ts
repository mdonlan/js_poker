interface Log {
    // items: [];
    print: boolean;
};

export let log: Log = {
    // items: []
    print: true
};

export function add_log_msg(message: string) {
    if (log.print) {
        console.log(message);
    }
}