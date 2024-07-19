import { useState, useEffect } from 'react'
import Form from './components/Form'
import Filter from './components/Filter'
import Details from './components/Details'
import Reset from './components/Reset'
import Notification from './components/Notification'
import Flag from './components/Flag'
import OneCountry from './components/OneCountry'
import axios from 'axios'
import './App.css'


function App() {
  const [countries, setCountries] = useState([]);
  const [country, setCountry] = useState('');
  const [namesFiltered, setNamesFiltered] = useState([]);
  const [shortList, setShortList] = useState([]);
  const [notification, setNotification] = useState('');
  const [nameTitle, setNameTitle] = useState('');
  const [capital, setCapital] = useState('');
  const [area, setArea] = useState('');
  const [languages, setLanguages] = useState([]);
  const [flag, setFlag] = useState(null);
  const [showCountry, setShowCountry] = useState('');
  const [oneCountryLangs, setOneCountryLangs] = useState([]);
  const [weather, setWeather] = useState('');

  const weatherKey ='eb5a6d5e7f101c2a76f277372a663c16';
  //const weatherBaseUrl = 'https://openweathermap.org/find';
  const client = axios.create({baseURL: 'http://api.openweathermap.org/data/2.5/forecast'});

 
  useEffect(() => {
    if (countries) {
      axios
      .get('https://studies.cs.helsinki.fi/restcountries/api/all')
      .then(response => {
        setCountries(response.data)
      })
    }
  }, [countries])
  
  
  const handleCountryName = (event) => {
    event.preventDefault();
    reset();
    setCountry(event.target.value);
  }

  
  const handleSearchCountry = (event) => {
    event.preventDefault();
    if (namesFiltered || shortList) {
      reset()
    }

    for (let i = 0; i < countries.length; i++) {
      if (countries[i]['name']['common'].toLowerCase().includes(country.toLowerCase())) {
        namesFiltered.push(countries[i]);
        setNamesFiltered(namesFiltered)
        }
      }
      
      if (namesFiltered.length > 10) {
        reset();
        setNotification('Too many results')
        setTimeout(() => {
          setNotification('');
          setNamesFiltered([]);
        },1000)
        
      } 

      if (namesFiltered.length === 1) {
        let langObj = namesFiltered[0]['languages'];
        for (let key in langObj) {
              let temp = {};
              temp['id'] = key;
              temp['language'] = langObj[key];
              languages.push(temp);
          }
        setLanguages(languages);
        setFlag(namesFiltered[0]['flags']['png'])
        setNameTitle(namesFiltered[0]['name']['common']);
        setCapital(namesFiltered[0]['capital']);
        setArea(namesFiltered[0]['area']);
      } 

      if (namesFiltered.length > 1 && namesFiltered.length < 10) {
          setShortList(namesFiltered)
          console.log(shortList)
      }
      getWeather();
  }

  const showOneCountry = (event) => {
    event.preventDefault();
     
    console.log(oneCountryLangs)
    console.log(shortList)
    const countryCca3 = event.target.value;
    const showOneCountry = shortList.filter(ele => ele['cca3'] == countryCca3)
                                    .map(ele => ele);
    //console.log(showOneCountry)                          
    const name = showOneCountry[0]['name']['common'];
    const capital = showOneCountry[0]['capital'];
    const area = showOneCountry[0]['area'];
    const flag = showOneCountry[0]['flags']['png'];
    const langObj = showOneCountry[0]['languages'];
    const countryObj = {'name': name, 'capital': capital, 'area': area, 'flag': flag};
    let tempArr = [];
      for (let key in langObj) {
        let temp = {};
        temp['id'] = key;
        temp['language'] = langObj[key];
        tempArr.push(temp)
      }

    countryObj['languages'] = tempArr;
    setShowCountry(countryObj)
    setFlag(countryObj.flag)
    getWeather();
    //console.log(countryObj.flag)
  }


  const getWeather = async () => {
    const requestParams = `?id=524901&appid=${weatherKey}`;
    let cityEndpoint = '';
    
    if (capital) {
      cityEndpoint = capital;
    }
    if (showCountry.capital) {
      cityEndpoint = showCountry.capital;
    }
    const urlToGet = `${cityEndpoint}${requestParams}`;
    try {
      const response = await client.get(urlToGet);
      console.log(response);
      if (response.status === 200) {
        const weatherObj = await response.data;
        //console.log(weatherObj);
        setWeather(weatherObj)
      }
    } catch (error) {
      console.log(error)
    }
  }
    

  // asycn guide
  /*
  const getMovieInfo = async (movie) => { 
      const movieId = movie.id
      const movieEndpoint = `/movie/${movieId}`;
      const requestParams = `?api_key=${tmdbKey}`;
      const urlToGet = `${movieEndpoint}${requestParams}`;
      if (randomMovie) {
        try {
          const response = await client.get(urlToGet);
           console.log(response)
          if (response.status === 200) {
            const movieObj = await response.data;
            setMovieInfo(movieObj);
            setPosterPath(movieObj['poster_path']);
          }
        } catch(error) {
          console.log(error);
        }
      }
  };
  */

  const reset = () => {
    setCountry('');
    setNamesFiltered([]);
    setShortList([])
    setNameTitle('')
    setFlag(null)
    setLanguages([])
    setCapital('')
    setArea('')
    setShowCountry('')
    setOneCountryLangs([])
  }

  


  return (
    <>
    
      <div>
        <h1> Country Finder </h1>
        <Notification text={notification} />
      </div>
      <div>
        <h2>search country: </h2>
        <Form funcName={handleCountryName} varCountry={country} />

        <p>debug: {country}</p>
        <Filter funcSearch={handleSearchCountry} />
        <span><br></br></span>

        <Reset funcReset={reset} />

        <h2>details: </h2>

        <OneCountry showOneLangs={showCountry.languages ? showCountry.languages : []} name={showCountry.name ? `Name: ${showCountry.name}`:''} 
        area={showCountry.area ? `Area: ${showCountry.area} km^2` : ''} capital={showCountry.capital ? `Capital: ${showCountry.capital}` : ''} />

        <Details showDetails={shortList ? shortList : []} showLangs={languages ? languages : []} showFunc={showOneCountry} title={namesFiltered ? nameTitle : ''} 
        capital={!capital ? '' : `Capital: ${capital}`} area={!area ? '' : `Area: ${area} km^2`} />

        <Flag url={!flag ? null : `${flag}`}/>
        
        

      </div>

      
      
    </>
  )
}

export default App
