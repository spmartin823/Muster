import React from 'react';
import { InstantSearch, SearchBox, Hits, Highlight, Pagination, HitsPerPage, InfiniteHits } from 'react-instantsearch/dom';
import { BrowserRouter as Router, Route, Link, Switch, Redirect } from 'react-router-dom';
import { connectHits } from 'react-instantsearch/connectors';

function foundItem({ hit }) {
  // console.log('this is state in founditem', console.log(this))
  return(
    <div onClick={(e) => {
      e.preventDefault()
      window.setSelectedItemState(e.target.innerHTML)
    } }>
    { window.indexName === undefined &&
        (<div>
          <button>
            { hit? hit.title : null }
          </button>
          <br/>
        </div>) }

      {window.indexName === 'item' &&
      (<div >
        <button>
          { hit? hit.title : null }
        </button>
        <br/>
      </div>) }

      {window.indexName === 'users' &&
        (<div onClick={ ()=> window.selectedItem = [hit.objectID, hit] }>
          <button>
            { hit.profileInfo ? hit.profileInfo.username : null }
          </button>
      </div>) }

      {window.indexName === 'category' &&
          (<div onClick={ ()=> window.selectedItem = [hit.objectID, hit] }>
          <button>
            { hit ? hit.objectID : null }
          </button>
      </div>) }


    </div>
  )
}

//think of this as Search Result List component. it's like Search Result List Entry, maps and formats each found entry
function Search(props) {
    return (
      <div className="search-container">
        <div style={ { float: "center" } }>
        <Hits 
        hits={props.hits}
        hitComponent={ foundItem } />
        </div>
      </div>
    )
  }

export default connectHits(Search)

//place through higher order function

export class TradeSearch extends React.Component {
  constructor(props) {
    super(props);
  }

  render() {
    return (
      <header className="searchBar">
        <SearchBox translations={ { placeholder:'Search Me!' } } />
      </header>
    )
  }
}

