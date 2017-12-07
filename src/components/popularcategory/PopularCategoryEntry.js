import React from 'react';

class PopularCategoryEntry extends React.Component {
  constructor(props) {
    super(props)
  }
  render() {
    console.log(this.props.id)
    return(
      <div className='popular-category' key={this.props.id}>
        <img src={this.props.category.pictureurl}/>
        <h4>{this.props.id}</h4>
      </div>
    )
  }
}

export default PopularCategoryEntry;
