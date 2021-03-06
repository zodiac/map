
var Map = React.createClass({

  getInitialState: function () {
    return {
      dragging: false,
      offset: this.props.offset,
    }
  },

  onTouchStart: function (e) {

    e.stopPropagation()
    e.preventDefault()

    console.log(e);

    this.setState({
      dragging: true,
      mouse_start: {
        x: e.targetTouches[0].pageX,
        y: e.targetTouches[0].pageY
      }
    });

    document.addEventListener('touchmove', this.onTouchMove);
    document.addEventListener('touchend', this.onTouchEnd);

  },

  onTouchMove: function (e) {
    if (!this.state.dragging) return;
    var new_offset = {
      x: this.state.offset.x + e.targetTouches[0].pageX - this.state.mouse_start.x,
      y: this.state.offset.y + e.targetTouches[0].pageY - this.state.mouse_start.y,
    }

    window.last_offset = new_offset;

    var new_transform = "translate(" + new_offset.x + " " + new_offset.y + ")"
    $(React.findDOMNode(this)).children().attr('transform', new_transform);

    e.stopPropagation();
    e.preventDefault();
  },

  onMouseDown: function (e) {
    if (e.button !== 0) return;

    e.stopPropagation();
    e.preventDefault();

    this.setState({
      dragging: true,
      mouse_start: {
        x: e.pageX,
        y: e.pageY
      }
    });

    document.addEventListener('mousemove', this.onMouseMove)
    document.addEventListener('mouseup', this.onMouseUp)

  },

  onMouseUp: function (e) {
    this.setState({dragging: false})

    e.stopPropagation()
    e.preventDefault()

    var new_offset = {
      x: this.state.offset.x + e.pageX - this.state.mouse_start.x,
      y: this.state.offset.y + e.pageY - this.state.mouse_start.y,
    }

    this.setState({
      offset: new_offset
    });

    this.props.onMapDrop(new_offset)

    document.removeEventListener('mousemove', this.onMouseMove)
    document.removeEventListener('mouseup', this.onMouseUp)

  },

  onTouchEnd: function (e) {
    this.setState({dragging: false})

    e.stopPropagation();
    e.preventDefault();

    this.props.onMapDrop(window.last_offset);

    document.removeEventListener('mousemove', this.onMouseMove)
    document.removeEventListener('mouseup', this.onMouseUp)
  },

  onMouseMove: function (e) {
    if (!this.state.dragging) return;
    var new_offset = {
      x: this.state.offset.x + e.pageX - this.state.mouse_start.x,
      y: this.state.offset.y + e.pageY - this.state.mouse_start.y,
    }

    var new_transform = "translate(" + new_offset.x + " " + new_offset.y + ")"
    $(React.findDOMNode(this)).children().attr('transform', new_transform);

    e.stopPropagation()
    e.preventDefault()
  },

  shouldComponentUpdate: function (next_props) {
    if (next_props.geojsons.length > this.props.geojsons.length) return true;
    if (next_props.color_scheme !== this.props.color_scheme) return true;
    if (next_props.zoom !== this.props.zoom) return true;
    if (next_props.offset !== this.props.offset) return true;
    return false;
  },

  debug: function () {
    var self = this;
    console.log(JSON.stringify(self.props.bounds), JSON.stringify(self.state.offset));
  },

  render: function () {

    var self = this;

    self.debug();

    var color_code = color_codes[self.props.color_scheme];
    return (
      <svg onTouchStart={this.onTouchStart} onMouseDown={this.onMouseDown} width={self.props.bounds.map_width} height={self.props.bounds.map_height}>

        <g transform={"translate(" + self.state.offset.x + " " + self.state.offset.y + ")"}>

        {self.props.geojsons.map(function (geojson) {
          return (
            <g>
              <FeatureCollection data={geojson.earth} bounds={self.props.bounds} fill={color_code.earth} />
              <FeatureCollection data={geojson.water} bounds={self.props.bounds} fill={color_code.water} />
              <FeatureCollection data={geojson.roads} bounds={self.props.bounds} stroke={color_code.roads} />
              <FeatureCollection data={geojson.buildings} bounds={self.props.bounds} fill={color_code.buildings.fill} stroke={color_code.buildings.stroke}/>
              <FeatureCollection data={geojson.transit} bounds={self.props.bounds} fill={color_code.transit} stroke={color_code.transit} />
            </g>
          )
        })}

        </g>

      </svg>
    );
  }

});