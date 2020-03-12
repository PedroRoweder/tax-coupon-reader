import React, { Fragment, useState } from 'react';
import './App.css';
import ImageUpload from './view/viewImageUpload';
import HeaderComponent from './view/viewHeaderComponent';
import loading from './assets/loading.gif'

const Details = ({ CNPJ, COO, DAT, DateInconsistency, TimeInconsistency, imagePath }) => {
  //setLoading(false);
  let path = `http://localhost:5000/uploads/${imagePath}`;
  return (
  <div className="mb-4 grid">
    <img src={path} alt="user uploaded" className="coupon-image"></img>
    <div className="details">
      <p className="">CNPJ: {CNPJ}</p>
      <p className="">COO: {COO}</p>
      <p className="">Date and Time: {DAT}</p>
    </div>
    {DateInconsistency && <div class="alert alert-warning" role="alert">The date could not be read correctly and can be innacurate</div>}
    {TimeInconsistency && <div class="alert alert-warning" role="alert">The time could not be read correctly and can be innacurate</div>}
  </div>
)}

const Loading = () => (
  <img src={loading} alt="Loading..." id="loadingImg"/>
)

const App = () => {
  const [details, setDetails] = useState(null);
  const [loaded, setLoaded] = useState(true);

  return (
    <div className="container mb-4">
      <HeaderComponent />
      <ImageUpload onUpload={setDetails} onLoad={setLoaded} />
      {(details && <Details {...details}/>) || (!loaded && <Loading />)}
    </div>
)
};

export default App;
