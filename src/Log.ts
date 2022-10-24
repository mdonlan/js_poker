interface Log {
    // items: [];
    print: boolean;
};

export let log: Log = {
    // items: []
    print: true
};

const log_messages_elem = document.querySelector(".log_messages");

export function add_log_msg(message: string) {
    if (log.print) {
        console.log(message);
    }

    // log_messages_elem.innerHTML += `<div>${message}</div>`
}