
interface ICache {
    status: string,
    data: any,
    err: any,
}

export const async2sync = (func: () => Promise<any>) => {
    let cache: ICache[] = [];
    let i = 0;
    const _originFunc = func;

    func = () => {
        if (cache[i]) {
            if (cache[i].status === 'fulfulled') {
                return cache[i].data;
            } else if (cache[i].status === 'rejected') {
                throw cache[i].err;
            }
        }
        const result: ICache = {
            status: 'pending',
            data: null,
            err: null
        }
        cache[i++] = result;

        const prom =  _originFunc().then(
            (resp) => {
                result.status = "fulfulled";
                result.data = resp;
            },
            (err) => {
                result.status = "rejected";
                result.err = err;
            }
        );
        throw prom;
    }
    try {
        func();
    }
    catch(err) {
        if (err instanceof Promise) {
            const reRun = () => {
                i = 0;
                func();
            }
            err.then(
                reRun,
                reRun,
            );
        }
    }
}