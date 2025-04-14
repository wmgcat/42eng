export function init(func) {
    window.parent.postMessage('getSDK', '*');
    window.addEventListener('message', event => {
        try {
            let { data } = event;
            data = JSON.parse(data);
            if (data.event != 'wconn_sdk')
                return;
            
            if (func)
                func(data);
        }
        catch(err) {
            console.log('[err]:', err);
        }
    });
}