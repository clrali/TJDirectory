import { MenuItem, TextField, Select, FormControl, InputLabel, Button} from '@mui/material';
import {
  MuiPickersUtilsProvider,
  KeyboardDatePicker
} from '@material-ui/pickers';
import 'date-fns';
import DateFnsUtils from '@date-io/date-fns';

import {addDoc, writeBatch, deleteDoc, collection, doc, getDocs, query, where} from 'firebase/firestore'
import { db } from './firebaseSetup'
import { useState, useEffect, useRef} from "react"
import { Timestamp } from 'firebase/firestore'

import '../styling/calendar.css'

function SchoolCalendar() {
    const [info, setInfo] = useState([])
    const date = useRef(null)
    const desc = useRef(null)
    const staff = useRef(null)
    const event = useRef(null)
    const [calendarID, setCalendarID]=useState();

    const Data=(props) => {
        return (
            <div className='CalendarEvent'>
                <td>{props.property}</td>
            </div>
        )
    }

    useEffect(() => {
        const info = []
        getDocs(collection(db, "Events"))
        .then((allInfo) => {
            allInfo.forEach((doc) =>
                info.push({...doc.data()})
            )
            info.sort((a, b) => {
                return a.date.seconds - b.date.seconds
            })
            setInfo(info)
        
        })}, [db])

    const addEvent = (e) => {
        e.preventDefault();

        const x = new Date(date.current.value).getTime() / 1000
        
        const timeStamp = new Timestamp(x, 0)

        const newEvent = {
            date: timeStamp,
            event: event.current.value, 
            descrip: desc.current.value,
            staff: staff.current.value,
        } 
        addDoc(collection(db, "Events"), newEvent)
        .then((docRef) =>{
            setInfo([...info, {id:docRef.id, ...newEvent}])
        })
        .catch((e) => console.error(e))

        date.current.value = null
        event.current.value = null
        desc.current.value = null
        staff.current.value = null
    }

    const deleteEvent = async (e, event) => {
      e.preventDefault();
      const eventRef = collection(db, "Events");
      const q = query(eventRef, where("descrip", "==", event.descrip));
      const querySnapshot = await getDocs(q);
      querySnapshot.forEach((doc) => {
          doc.data();
          setCalendarID(doc.id);
      });
      deleteDoc(doc(db, "Events", calendarID))
    }

    const [selectedDate, setSelectedDate] = useState()
    const handleDateChange=(date) => {
        setSelectedDate(date)
    }

    return (
        <div>
        <h2>School Calendar</h2>
        <form onSubmit={addEvent} >
            <p>
              <MuiPickersUtilsProvider utils={DateFnsUtils}>
                <KeyboardDatePicker
                format="MM/dd/yyyy"
                label="Birthdate"
                required
                value={selectedDate}
                onChange={handleDateChange}
                inputRef={date}
                />
              </MuiPickersUtilsProvider>
            </p>
            <p>
              <TextField 
              required
              variant='outlined'
              label="Event"
              inputRef={event}/>
            </p>
            <p>
              <TextField 
                required
                variant='outlined'
                label="Description"
                inputRef={desc}/>
            </p>
            <p>
              <TextField 
              required
              variant='outlined'
              label="Staff"
              inputRef={staff}/>
            </p>
            <Button
                type="submit"
                variant="outlined">
                Add Event
            </Button>
            </form>
            
        <table className='calendarTable'>
          <caption>Calendar</caption>
          <thead>
            <tr>
              <td> </td>
              <th scope="col">Date</th>
              <th scope='col'>Event</th>
              <th scope="col">Description</th>
              <th scope="col">Staff</th>
              <th scope="col"></th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <th scope="row"></th>
              <td>
              {info.map((event) => (
                <Data property={new Date(event.date.seconds * 1000).toDateString()} />
              ))}
              </td>
              <td>
              {info.map((event) => (
                <Data property={event.event} />
              ))}
              </td>
              <td>
              {info.map((event) => (
                <Data property={event.descrip} />
              ))}
              </td>
              <td>
              {info.map((event) => (
                <Data property={event.staff} />
              ))}
              </td>
              <td>
              {info.map((event) => (
                <form onSubmit={(e)=>deleteEvent(e, event)} >
                    <input id="delete" type="submit" name="delete" value="Delete"/>
               </form>
              ))}
              </td> 
            </tr>
          </tbody>
        </table>
        </div>
    )
}

export default SchoolCalendar