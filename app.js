function saveData() {

    const data = {

        client: document.getElementById("client").value,

        date: document.getElementById("date").value,

        therapist: document.getElementById("therapist").value,

        notes: document.getElementById("notes").value

    };

    localStorage.setItem(

        "abaSession",

        JSON.stringify(data)

    );

    alert("Session Saved");

}

window.onload = () => {

    const saved = JSON.parse(

        localStorage.getItem("abaSession")

    );

    if (!saved) return;

    document.getElementById("client").value = saved.client;

    document.getElementById("date").value = saved.date;

    document.getElementById("therapist").value = saved.therapist;

    document.getElementById("notes").value = saved.notes;

};
