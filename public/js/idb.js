const indexedDB =
    window.indexedDB ||
    window.mozIndexedDB ||
    window.webkitIndexedDB ||
    window.msIndexedDB ||
    window.shimIndexedDB;

let db;
const request = indexedDB.open("budget", 1)

request.onupgradeneeded = (e) => {
    let data = e.target.result
    data.createObjectStore("pending", { autoIncrement: true })
}

request.onsuccess = (e) => {
    db = e.target.result
    if (navigator.onLine) {
        checkdatabase()
    }
}

request.onerror = function (event) {
    console.log("Woops! " + event.target.errorCode);
};

function saveRecord(record) {
    const transaction = db.transaction(["pending"], "readwrite");
    const store = transaction.objectStore("pending");

    store.add(record);
}


function checkdatabase() {
    const transaction = db.transaction(["pending"], "readwrite")
    const store = transaction.objectStore("pending")
    const all = store.getAll()
    all.onsuccess = () => {
        if (all.result.length > 0) {
            fetch("/api/transaction/bulk", {
                method: "POST",
                body: JSON.stringify(all.result),
                headers: {
                    Accept: "application/json, text/plain, */*",
                    "Content-Type": "application/json"
                }
            }).then(res => {
                return res.json()
            }).then(() => {
                const transaction = db.transaction(["pending"], "readwrite")
                const store = transcation.objectStore("pending")
                store.clear()
            })
        }
    }
}

window.addEventListener("online", checkdatabase())