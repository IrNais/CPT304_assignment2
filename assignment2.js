const countrySelect = document.getElementById("country");
const citySelect = document.getElementById("city");
const holidaysDiv = document.getElementById("holidays");
const queryInfoDiv = document.getElementById("query-info");
const queryCountrySpan = document.getElementById("query-country");
const queryCitySpan = document.getElementById("query-city");
const queryHolidaySpan = document.getElementById("query-holiday");

const cities = {
  US: ["New York", "Los Angeles", "Chicago"],
  CN: ["Beijing", "Shanghai", "Guangzhou"],
  CA: ["Toronto", "Vancouver", "Montreal"]
};
const cityRegionIds = {
  'New York': 2621,
  'Los Angeles': 2011,
  'Chicago': 829,
  'Beijing': 597,
  'Shanghai': 3145,
  'Guangzhou': 6064259,
  'Toronto': 4089,
  'Vancouver': 4106,
  'Montreal': 4005
};

// Update the selection box
countrySelect.addEventListener("change", async function () {
  const countryValue = countrySelect.value;
  citySelect.innerHTML = '<option value="">City-select</option>';
  citySelect.disabled = countryValue === "";
  if (countryValue !== "") {
    cities[countryValue].forEach(city => {
      const option = document.createElement("option");
      option.value = city;
      option.text = city;
      citySelect.add(option);
    });
  }
  if (countryValue === "") {
    holidaysDiv.style.display = "none";
  } else {
    const url = `https://public-holiday.p.rapidapi.com/2023/${countryValue}`;
    const options = {
      method: 'GET',
      headers: {
        'X-RapidAPI-Key': '397305497emsh3df8a41ed46932ep1dd728jsnca7357578da9',
        'X-RapidAPI-Host': 'public-holiday.p.rapidapi.com'
      }
    };
    try {
      const response = await fetch(url, options);
      const holidaysData = await response.json();
      let holidaysHtml = "";
      holidaysData.forEach(function (holiday, index) {
        holidaysHtml += `<div><input type="radio" name="holiday" id="holiday-${index}" value="${holiday.date} - ${holiday.name}"><label for="holiday-${index}">${holiday.date} - ${holiday.name}</label></div>`;
      });
      holidaysDiv.innerHTML = holidaysHtml;

      holidaysDiv.style.display = "block";
    } catch (error) {
      console.error(error);
    }
  }
});

//display query info
holidaysDiv.addEventListener("change", function (event) {
  if (event.target.name === "holiday") {
    queryCountrySpan.textContent = countrySelect.options[countrySelect.selectedIndex].text;
    queryCitySpan.textContent = citySelect.value;
    queryHolidaySpan.textContent = event.target.value.slice(0, 10);
    queryInfoDiv.style.display = "block";
  }
});

//query Weather and hotel
function query() {
  const cityValue = queryCitySpan.textContent;
  const date = queryHolidaySpan.textContent;
  if (cityValue === "") {
    weatherList.style.display = "none";
    weatherTitle.style.display = "none";
    flag1 =1;
  } else {
    fetchWeather(cityValue);
    fetchHotel(cityValue,date);
    flag1 =2;
  }
}

//fetch Weather information
async function fetchWeather(city) {
  const url = `https://forecast9.p.rapidapi.com/rapidapi/forecast/${city}/summary/`;
  const options = {
    method: 'GET',
    headers: {
      'X-RapidAPI-Key': '397305497emsh3df8a41ed46932ep1dd728jsnca7357578da9',
      'X-RapidAPI-Host': 'forecast9.p.rapidapi.com'
    }
  };
  try {
    const response = await fetch(url, options);
    const result = await response.json();
    const weatherData = result.forecast.items.slice(0, 4);

    let weatherHtml = "";
    weatherData.forEach(function (weather) {
      weatherHtml += `<li>${weather.date}: ${weather.weather.text} - Minimum temperature: ${weather.temperature.min}°C - Maximum temperature: ${weather.temperature.max}°C</li>`;
    });

    const weatherList = document.getElementById("weather");
    weatherList.innerHTML = weatherHtml;
    document.getElementById("weatherTitle").style.display = "block";
    weatherList.style.display = "block";
  } catch (error) {
    console.error(error);
  }
}

//Template string for display hotel information
function displayHotelInfo(hotel) {
  return `
  <div class="hotel">
      <h2>${hotel.name}</h2>
      <img src="${hotel.propertyImage.image.url}" alt="${hotel.propertyImage.image.description}" width="200">
      <p>Available rooms: ${hotel.availability.minRoomsLeft}</p>
      <p>Distance from destination: ${hotel.destinationInfo.distanceFromDestination.value} ${hotel.destinationInfo.distanceFromDestination.unit}</p>
      <p>Price per night: ${hotel.price.lead.formatted}</p>
      <p>Total price: ${hotel.price.displayMessages[1].lineItems[0].value}</p>
      <p>Review score: ${hotel.reviews.score} (${hotel.reviews.total} reviews)</p>
      <p>Star rating: ${hotel.star} stars</p>
  </div>
  <hr>
  `;
}

//fetch hotel information
async function fetchHotel(city,date) {
  const regionId = cityRegionIds[city];
  const today = new Date(date);
  const tomorrow = new Date(date);
  tomorrow.setDate(tomorrow.getDate() + 1);
  const checkinDate = today.toISOString().split('T')[0];;
  const checkoutDate = tomorrow.toISOString().split('T')[0];

  const currentDate =  new Date();
  if(today.getTime() <= currentDate.getTime()){
    const hotelsList = document.getElementById('hotels-list');
    hotelsList.innerHTML = "Choose a holiday after today";
    hotelsList.style.display = "block";
    return;
  }
  const url = `https://hotels-com-provider.p.rapidapi.com/v2/hotels/search?checkin_date=${checkinDate}&adults_number=1&region_id=${regionId}&checkout_date=${checkoutDate}&locale=en_GB&sort_order=REVIEW&domain=AE&star_rating_ids=3%2C4%2C5&payment_type=PAY_LATER%2CFREE_CANCELLATION&lodging_type=HOTEL%2CHOSTEL%2CAPART_HOTEL&price_max=500&amenities=WIFI%2CPARKING&children_ages=4%2C0%2C15&page_number=1&price_min=10&guest_rating_min=8&meal_plan=FREE_BREAKFAST&available_filter=SHOW_AVAILABLE_ONLY`;
  const options = {
    method: 'GET',
    headers: {
      'X-RapidAPI-Key': '397305497emsh3df8a41ed46932ep1dd728jsnca7357578da9',
      'X-RapidAPI-Host': 'hotels-com-provider.p.rapidapi.com'
    }
  };
  try {
    const response = await fetch(url, options);
    const result = await response.json();
    const hotelsData = result.properties.slice(0, 5); // Take the first five hotels
    const hotelsList = document.getElementById('hotels-list');
    hotelsList.innerHTML = hotelsData.map(displayHotelInfo).join('');
    hotelsList.style.display = "block";
  } catch (error) {
    console.error(error);
  }
}
