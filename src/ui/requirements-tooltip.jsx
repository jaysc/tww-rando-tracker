import _ from 'lodash';
import PropTypes from 'prop-types';
import React from 'react';

class RequirementsTooltip extends React.PureComponent {
  render() {
    const { requirements, otherUserItems } = this.props;

    const requirementsList = _.map(requirements, (elements, rowIndex) => (
      <li key={rowIndex}>
        {
          _.map(elements, ({ color, text }, elementIndex) => (
            <span className={color} key={elementIndex}>{text}</span>
          ))
        }
      </li>
    ));

    return (
      <div className="tooltip">
        <div className="tooltip-title">Items Required</div>
        <ul>
          {requirementsList}
        </ul>
        {!_.isEmpty(otherUserItems) && (
        <>
          <div className="tooltip-title">Other Users Item at Location</div>
          <div>{otherUserItems}</div>
        </>
        )}
      </div>
    );
  }
}

RequirementsTooltip.defaultProps = {
  otherUserItems: null,
};

RequirementsTooltip.propTypes = {
  requirements: PropTypes.arrayOf(PropTypes.array).isRequired,
  otherUserItems: PropTypes.arrayOf(PropTypes.string),
};

export default RequirementsTooltip;
