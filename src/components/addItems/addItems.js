import React from 'react';
import * as firebase from 'firebase';
import UserInfo from '../userBar/UserInfo.jsx';
import ImageUpload from '../helperElements/imageUploader';
import InProgressCarousel from './inProgressCarousel';
import ImageRecog from '../helperElements/imageRecog';
import FormDropDown from './FormDropDown';


class AddItems extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      //new book fields
      uid: null,
      title: '',
      images: [],
      notes: '',
      upc: '',
      onlinePrice: '',
      storeLinks: {},
      subject: '',
      price: '',

      //location states
      _geoloc: {},
      _geolocPosition: null,
      _geolocName: 'your location',
      _geoSavingName: false,
      _geolocImage: '',
      
      //component fields (used in addItems)
      id: null,
      keywords: [],
      collectionId: '',
      customKeyword: '',
      savedKeywords: [],
      showDetailed: false,
      collectionList: [{id: null, name: 'loading collections...'}],
      locationList: [{lat: 0, lng: 0, name: 'default place'}],
      sell: '',
      
      // //depricated fields
      location: '',
      boughtFrom: '',
      name: '',
      imageUrl: '',
      imageUrlUploaded: false,
      thumbnailUrl: '',
      productIds: '',
      purchaseTime: ''
    };

    this.setImageState = this.setImageState.bind(this);
    this.setKeywordsState = this.setKeywordsState.bind(this);
    this.setItemState = this.setItemState.bind(this);
    this.addRemoveKeyword = this.addRemoveKeyword.bind(this);
    this.addCustomeKeyword = this.addCustomeKeyword.bind(this);
    this.handleChange = this.handleChange.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
    this.geoFindMe = this.geoFindMe.bind(this);
    this.geoAddName = this.geoAddName.bind(this);
    // this.setGeoImage = this.setGeoImage.bind(this);
  };

  setImageState(imageUrl) {
    var currentImages = this.state.images.slice();
    currentImages.unshift(imageUrl);
    this.setState({ 
      imageUrl: imageUrl,
      images: currentImages
    });
  };

  setKeywordsState(keywords) {
    this.setState({ keywords });
  };

  setItemState(item) {

    this.setState({
      title: item.title,
      images: item.images,
      notes: item.notes,
      upc: item.upc,
      onlinePrice: item.onlinePrice,
      storeLinks: item.storeLinks,
      subject: item.subject,

      id: item.id,
      name: item.name,
      imageUrl: item.images[0],
      collectionId: item.collectionId,
      location: item.location,
      keywords: [],
      savedKeywords: []
    });
  };

  //Handles dynamically adding and removing keywords from suggested to saved
  addRemoveKeyword(keyword) {
    let savedKeywords = this.state.savedKeywords;
    if (savedKeywords.includes(keyword)) {
      let index = savedKeywords.indexOf(keyword);
      if (index >= 0) { savedKeywords.splice(index, 1)};
    } else {
      savedKeywords = savedKeywords.concat(keyword);
    }
    this.setState({ savedKeywords });
    this.setState({ customKeyword:'' })
  };

  addCustomeKeyword(keyword){
    this.addRemoveKeyword(keyword);
  };

  handleChange(event) {
    event.preventDefault()
    const target = event.target;
    const value = target.value;
    const name = target.name;
    this.setState({
      [name]: value
    })
  };
  
  //Submits information in fields to the database
  handleSubmit(event) {
    
    let currentUID = firebase.auth().currentUser.uid
    
    let postData = {
      //new book fields
      uid: currentUID,
      title: this.state.title,
      images: this.state.images,
      notes: this.state.notes,
      upc: this.state.upc,
      onlinePrice: this.state.onlinePrice,
      storeLinks: this.state.storeLinks,
      subject: this.state.subject,
      _geoloc: this.state._geoloc,
      collectionId: this.state.collectionId,
      savedKeywords: this.state.savedKeywords,
      sell: this.state.sell,
      price: this.state.price
      
      //depricated fields
      // location: this.state.location,
      // productIds: this.state.productIds,
      // purchaseTime: this.state.purchaseTime,
      // boughtFrom: this.state.boughtFrom,
      // name: this.state.name,
      // imageUrl: this.state.imageUrl,
    };
    
    let newPostKey = this.state.id || 
      firebase.database().ref('/item').push().key;

    let updates = {};
    updates['/users/' + currentUID + '/itemIds/' + newPostKey] = newPostKey;
    updates['/item/' + newPostKey] = postData;
    updates['/collection/' + this.state.collectionId + 
            '/itemId/' + newPostKey] = newPostKey;

    return firebase.database().ref().update(updates);

    // event.target.reset();
  };

  //Gets user geolocation
  geoFindMe() {
    var output = document.getElementById("out");
    if (!navigator.geolocation) {
      output.innerHTML = "<p>Geolocation is not supported by your browser</p>";
      return;
    }
    output.innerHTML = "<p>Locating…</p>";
    navigator.geolocation.getCurrentPosition((position) => {
      var x = position.coords.latitude;
      var y = position.coords.longitude;
      var position = {lat: x, lng: y}

      output.innerHTML = '<p>Latitude is ' + x + '° <br>Longitude is ' + y + '°</p>';

      var img = "https://maps.googleapis.com/maps/api/staticmap?center=" + x + "," + y + "&zoom=17&size=400x400&sensor=false";

      this.setState({
        _geolocPosition: position,
        _geolocImage: img
      })
    },
    () => {
      output.innerHTML = "Unable to retrieve your location";
    })
  }

  geoAddName(){

    let updates = {};
    updates['/users/' + this.props.userId + '/locations/' + this.state._geolocName] = this.state._geolocPosition;

    return firebase.database().ref().update(updates);
  }

  componentDidMount() {

    //Checks database for collections owned by the user
    let collectionRef = firebase.database().ref('/collection');
    collectionRef.on("value", (snapshot) => {
      let currentUID = firebase.auth().currentUser.uid;
      // let currentUID = this.props.userId;
      let grabIdName = Object.keys(snapshot.val()).map((key, i) => {
        return {
          id: Object.keys(snapshot.val())[i],
          name: snapshot.val()[key].name,
          uid: snapshot.val()[key].uid,
          value: Object.keys(snapshot.val())[i],
          label: snapshot.val()[key].name

        }
      })
        .filter(collection => collection.uid.includes(currentUID));
      this.setState({
        collectionList: grabIdName,
        uid: currentUID
      });

    }, (error) => { console.error(error) }
    );

    // let locationRef = firebase.database().ref(`/users/${this.state.uid}/locations/`);
    // locationRef.on("value", (snapshot) => {
    //   let grabLocations = Object.keys(snapshot.val()).map((key, i) => {
    //     return {
    //       lat: snapshot.val()[key].lat,
    //       lng: snapshot.val()[key].lng,
    //       name: key,
    //       value: {lat: snapshot.val()[key].lat, lng: snapshot.val()[key].lng},
    //       label: snapshot.val()[key].name
    //     }
    //   });

    //   this.setState({
    //     locationList: grabLocations
    //   });

    // }, (error) => { console.error(error) }
    // );

    //Checks for props from the edit button in inventory manager
    if (this.props.editItem) {
      let clickedItem = this.props.editItem;
      let itemRef = firebase.database().ref('/item/' + clickedItem);

      itemRef.on("value", (snapshot) => {
        this.setState({
          //new book fields
          id: this.props.editItem,
          title: snapshot.val().title,
          images: snapshot.val().images,
          notes: snapshot.val().notes,
          upc: snapshot.val().upc,
          onlinePrice: snapshot.val().onlinePrice,
          storeLinks: snapshot.val().storeLinks,
          subject: snapshot.val().subject,
          _geoloc: snapshot.val()._geoloc,
          savedKeywords: snapshot.val().savedKeywords || [],
          collectionId: snapshot.val().collectionId,
          sell: snapshot.val().sell,
          price: snapshot.val().price,
          
          //depricated fields 
          // name: snapshot.val().name,
          // location: snapshot.val().location,
          // imageUrl: snapshot.val().images[0],
          // productIds: snapshot.val().productIds,
          // purchaseTime: snapshot.val().purchaseTime,
          // boughtFrom: snapshot.val().boughtFrom
          
        });
      }, (error) => { console.error(error) });
    }
  }

  componentDidUpdate() {
    //Checks if keywords are empty, if so, loads them using ImageRecog
    if (this.state.keywords.length > 0) {
    } else {
      if (this.state.imageUrl) {
        ImageRecog(this.state.imageUrl, (keywords) => {
          this.setState({ keywords })
        });
      }
    };
  }

  render() {
    return (
      <div className="additems-container">
        <div className="">
          <div>

            {/* <FormDropDown arrayOfObjects={this.state.collectionList}/> */}
            <ImageUpload 
              setImageState={this.setImageState} 
              setKeywordsState={this.setKeywordsState}
              imageUrl={this.state.imageUrl}
              images={this.state.images}
            />
            
            {
            (this.state.keywords.length > 0) ?
            <div>
              <label>Suggested</label>
              <div>
                <ul id="menu">
                  {this.state.keywords.map(keyword =>
                    <button className="btn .btn-link btn-xs" onClick={() => { this.addRemoveKeyword(keyword) }}>{'+ ' + keyword}</button>)}
                </ul>
              </div>
            </div>
            :
            <div></div>
            }

            <div>
              <label>Keywords</label>
              <div>
                <ul id="menu">
                  {this.state.savedKeywords.map(keyword =>
                    <button className="btn .btn-link btn-xs" onClick={() => { this.addRemoveKeyword(keyword) }}>{keyword + '  ̽'}</button>)}
                </ul>

                <input
                  className="form-control"
                  name="customKeyword"
                  component="input"
                  type="text"
                  placeholder="add a keyword"
                  value={this.state.customKeyword}
                  onChange={this.handleChange}
                  required
                />

                <button onClick={() => { this.addRemoveKeyword(this.state.customKeyword) }}>+</button>

              </div>
            </div>

          </div>

          <form onSubmit={this.handleSubmit.bind(this)}>
            <div className="form-group">

              <div>
                <label>Collection</label>
                <div>
                  <select
                    className="form-control"
                    name="collectionId"
                    component="select"
                    value={this.state.collectionId}
                    onChange={this.handleChange}
                    required
                  >
                    <option></option>
                    {this.state.collectionList.map(collection =>
                      <option value={collection.id}>{collection.name}</option>)}
                  </select>
                </div>
              </div>

              <div>
                <label>Title</label>
                <div>
                  <input
                    className="form-control"
                    name="title"
                    component="input"
                    type="text"
                    placeholder="title of book..."
                    value={this.state.title}
                    onChange={this.handleChange}
                    required
                  />
                </div>
              </div>

              <div>
                <label>Subject</label>
                <div>
                  <input
                    className="form-control"
                    name="subject"
                    component="input"
                    type="text"
                    placeholder="subject"
                    value={this.state.subject}
                    onChange={this.handleChange}
                    required
                  />
                </div>
              </div>
              <div>
                <label>Location</label>
                <div>
                  <select
                    className="form-control"
                    name="locationList"
                    component="select"
                    value={this.state._geoloc}
                    onChange={this.handleChange}
                    required
                  >
                    <option></option>
                    {this.state.locationList.map(location =>
                      <option value={location}>{location.name}</option>)}
                  </select>
                </div>
              </div>

              <a onClick={this.geoFindMe}>Use my current location</a>

              {

                (this.state._geolocPosition !== null) ?
                  <div id="out">
                    {/* <img src={this.state._geolocImage}/>     */}

                    <div>
                      <label>Name of Location</label>
                      <div>
                        <input
                          className="form-control"
                          name="_geolocName"
                          component="text"
                          placeholder="Name of location"
                          value={this.state._geolocName}
                          onChange={this.handleChange}
                        />
                      </div>
                    </div>
                    <a onClick={this.geoAddName}>Save to Location List</a>
                  </div>

                  :

                  <div id="out"></div>

              }

              {this.state.showDetailed ? 
              (
              <div>
              <div>

                <label>Notes</label>
                <div>
                  <input
                    className="form-control"
                    name="notes"
                    component="text"
                    placeholder="notes..."
                    value={this.state.notes}
                    onChange={this.handleChange}
                  />
                </div>
              </div>

              {/* <div>
                <label>UPC</label>
                <div>
                  <input
                    className="form-control"
                    name="UPC"
                    component="input"
                    type="text"
                    placeholder="UPC of book..."
                    value={this.state.upc}
                    onChange={this.handleChange}
                    required
                  />
                </div>
              </div> */}
              
              <div>
                <label>Online Price</label>
                <div>
                  <input
                    className="form-control"
                    name="subject"
                    component="input"
                    type="text"
                    placeholder="Price of book..."
                    value={this.state.onlinePrice}
                    onChange={this.handleChange}
                    required
                  />
                </div>
              </div>

              <div>
                <label>Your Selling Price</label>
                <div>
                  <input
                    className="form-control"
                    name="price"
                    component="input"
                    type="text"
                    placeholder="$1.00"
                    value={this.state.price}
                    onChange={this.handleChange}
                  />
                </div>
              </div>
{/* 
              <div>
                <label>Bought From</label>
                <div>
                  <input
                    className="form-control"
                    name="boughtFrom"
                    component="input"
                    type="text"
                    placeholder="where did you buy this from?"
                    value={this.state.boughtFrom}
                    onChange={this.handleChange}
                  />
                </div>
              </div>

              <div>
                <label>Amazon Link</label>
                <div>
                  <input
                    className="form-control"
                    name="productIds"
                    component="input"
                    type="text"
                    placeholder="https://www.amazon.com/..."
                    value={this.state.productIds}
                    onChange={this.handleChange}
                  />
                </div>
              </div>

              <div>
                <label>Purchase Date</label>
                <div>
                  <input
                    className="form-control"
                    name="purchaseTime"
                    component="input"
                    type="text"
                    placeholder="where did you buy this?"
                    value={this.state.purchaseTime}
                    onChange={this.handleChange}
                  />
                </div>
              </div> */}

              <div>
                <div>
                  <label>For Sale?</label>
                  <input
                    name="sell"
                    id="sell"
                    component="input"
                    type="checkbox"
                    value={this.state.sell}
                    onChange={this.handleChange}
                  />
                </div>
              </div>
              </div>
              ) : (<div></div>)}

              <div>
                <input type="submit" value="Submit" />

                {this.state.showDetailed ? 
                  (<a onClick={() => { 
                    this.setState({ 
                      showDetailed:  !this.state.showDetailed 
                  }) }}>Hide Detailed</a>) :

                  (<a onClick={() => { 
                    this.setState({
                      showDetailed: !this.state.showDetailed 
                  }) }}>Show Detailed</a>)
                }

              </div>
            </div>
          </form>
        </div>

        <div className="additems-carousel">
          <InProgressCarousel
            setItemState={this.setItemState} 
            currentUserId={this.props.userId}/>
        </div>

      </div>
    )
  }
};

export default AddItems;
