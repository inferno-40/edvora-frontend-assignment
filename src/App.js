import Navbar from "./Components/Navbar";
import "./assets/styles/main.css";
import FilterSection from "./Components/FilterSection";
import CardsDisplay from "./Components/CardsDisplay";
import axios from "axios";
import { useState, useEffect } from "react";
function App() {
  //setting state
  const [show, setShow] = useState(false);//for filter dropdown menu
  const [filter, setFilter] = useState("nearest");//which filter to show
  const [user, setUser] = useState({});//stores user data when fetched from api

  const [narrAll, setNArrAll] = useState();//all nearest rides
  const [uarrAll, setUArrAll] = useState();//all upcoming rides
  const [parrAll, setPArrAll] = useState();//all past rides
  const [narrCur, setNArrCur] = useState();//nearest rides according to the filter
  const [uarrCur, setUArrCur] = useState();//upcoming rides according to the filter
  const [parrCur, setPArrCur] = useState();//past rides according to the filter

  const [stateArr, setStateArr] = useState();//stores states
  const [cityArr, setCityArr] = useState();//stores filtered cities
  const [fState, setFState] = useState("");//stores the selected state
  const [fCity, setFCity] = useState("");//stores the selected city
  const [map, setMap] = useState();



  useEffect(async () => {
    //getting user data
    await axios
      .get("https://assessment.api.vweb.app/user")
      .then(async (response) => {
        setUser(response.data);

        //getting array of all objects
        await axios
          .get("https://assessment.api.vweb.app/rides")
          .then((res) => {
            const temp1 = res.data;//to store the distance of each ride from the user
            const arr = res.data;//to map cities to states
            var d;
            var user_d = response.data.station_code;

            //getting distance value for all objects
            for (var i = 0; i < arr.length; i++) {
              d = 10000000;
              for (var j = 0; j < arr[i].station_path.length; j++) {
                if (Math.abs(arr[i].station_path[j] - user_d) < d) {
                  d = Math.abs(arr[i].station_path[j] - user_d);
                }
              }
              temp1[i].distance = d;
            }

            //sorting by distance
            for (var i = 0; i < temp1.length; i++) {
              for (var j = 0; j < temp1.length; j++) {
                if (temp1[i].distance < temp1[j].distance) {
                  var temp2 = temp1[i];
                  temp1[i] = temp1[j];
                  temp1[j] = temp2;
                }
              }
            }

            setNArrAll(temp1);
            setNArrCur(temp1);

            //filtering to get trains from past and future
            const upcoming = temp1.filter((item) => {
              return new Date(item.date) - new Date() > 0;
            });
            const past = temp1.filter((item) => {
              return new Date(item.date) - new Date() < 0;
            });

            setUArrAll(upcoming);
            setUArrCur(upcoming);
            setPArrAll(past);
            setPArrCur(past);

            //getting arrays of all states and cities
            const states = temp1.map((item) => {
              return item.state;
            });
            const cities = temp1.map((item) => {
              return item.city;
            });
            const statesUnique = [...new Set(states)];
            const citiesUnique = [...new Set(cities)];

            //creating an object to map state to city
            const stateMap = {};
            statesUnique.map((item) => {
              stateMap[item] = [];
            });
            for (var i = 0; i < arr.length; i++) {
              stateMap[arr[i].state].push(arr[i].city);
            }
            for (var i = 0; i < Object.keys(stateMap).length; i++) {
              stateMap[Object.keys(stateMap)[i]] = [
                ...new Set(stateMap[Object.keys(stateMap)[i]]),
              ];
            }//using set to delete duplicate mapping
            stateMap["all"] = citiesUnique;
            setMap(stateMap);
            setStateArr(statesUnique);
            setCityArr(citiesUnique);
          });
      });
  }, []);
  useEffect(() => {
    //handling change in state filter
    var select = document.getElementById("citySelect");
    if (select !== null && select !== undefined) {
      select.value = "all";
    }

    if (fState != "") {
      setCityArr(map[fState]);

      setNArrCur(narrAll.filter((item) => item.state == fState));
      setUArrCur(uarrAll.filter((item) => item.state == fState));
      setPArrCur(parrAll.filter((item) => item.state == fState));
    }
    if (fState == "all") {
      setCityArr(map[fState]);
      setNArrCur(narrAll);
      setUArrCur(uarrAll);
      setPArrCur(parrAll);
    }
  }, [fState, setFState]);

  useEffect(() => {
    //handling change in city filter
    if (fCity != "") {
      setNArrCur(narrAll.filter((item) => item.city == fCity));
      setUArrCur(uarrAll.filter((item) => item.city == fCity));
      setPArrCur(parrAll.filter((item) => item.city == fCity));
    }

    if (fCity == "all") {
      if (fState != "") {
        setNArrCur(narrAll.filter((item) => item.state == fState));
        setUArrCur(uarrAll.filter((item) => item.state == fState));
        setPArrCur(parrAll.filter((item) => item.state == fState));
      }
    }
  }, [fCity, setFCity]);
  return (
    <div className="App">
      <Navbar user={user} />
      <FilterSection
        filter={filter}
        setFilter={setFilter}
        show={show}
        setShow={setShow}
        uarr={uarrCur}
        parr={parrCur}
        states={stateArr}
        cities={cityArr}
        setFState={setFState}
        setFCity={setFCity}
      />
      <CardsDisplay
        array={narrCur}
        uarr={uarrCur}
        parr={parrCur}
        filter={filter}
      />
    </div>
  );
}

export default App;
