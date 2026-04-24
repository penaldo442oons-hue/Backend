const API = "http://localhost:5000"

export const getRequests = () =>
fetch(`${API}/requests`).then(r=>r.json())

export const createRequest = (data)=>
fetch(`${API}/requests`,{
method:"POST",
headers:{ "Content-Type":"application/json" },
body:JSON.stringify(data)
})

export const resolveRequest = (id)=>
fetch(`${API}/requests/${id}/resolve`,{
method:"PUT"
})

export const deleteRequest = (id)=>
fetch(`${API}/requests/${id}`,{
method:"DELETE"
})