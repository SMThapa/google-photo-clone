import axios from "axios";

export const GetImages = async () => {
    const res = await axios.get('/api/media')
    return res.data
}
