import { connect } from "react-redux";
import React, { Component } from "react";
class UnconnectedSearch extends Component {
  handleQuery = evt => {
    this.props.dispatch({ type: "query", q: evt.target.value });
  };
  render = () => {
    return (
      <div>
        <div>
          Search query
          <input
            type="text"
            onChange={this.handleQuery}
            value={this.props.query}
          />
        </div>
      </div>
    );
  };
}

let mapStateToProps = st => {
  return {
    query: st.searchQuery
  };
};
let Search = connect(mapStateToProps)(UnconnectedSearch);
export default Search;