A lightweight wrapper to use fetch more efficiently and easily and with better error handling, and this is promisified!

![Size](https://badgen.net/bundlephobia/minzip/fetch-req)
![Types](https://badgen.net/npm/types/fetch-req)
![Downloads](https://badgen.net/npm/dt/fetch-req)

---

**Basic usage:**  
import from CDN
```
<script type="text/javascript" src="https://unpkg.com/fetch-req@1.0.0"></script>
```

Or from NPM,

```
import fetch from 'fetch-req';
```


```
const someFunction = async ()=> {
  const respGET = await fetch.get('http://dummy.restapiexample.com/api/v1/employees');
  const respPOST = await fetch.post('http://dummy.restapiexample.com/api/v1/employees', { 'dummyData': 'Mukesh'});
}
```

**Additional methods:**  
**1. Poll** - call an endpoint and handle response in interval.  
```
const endpoint = () => fetch.get('http://dummy.restapiexample.com/api/v1/employees');

const poll = fetch.poll(endpoint, callback, 1000);
poll.pause();                // Pause polling
poll.resume();               // Resume polling
poll.updateInterval(1000);  // Update the interval, set it to 1000ms
```

**Note:** This doesn't use `setInterval`, and it **prevents the race conditions** because, it makes the next call exactly after given time(in ms) 
from the time last response received.

**2. Retry** - Retry no of times in case request fails.  
```
const resp = await fetch.retry(3).get('http://dummy.restapiexample.com/api/v1/employees');
```
