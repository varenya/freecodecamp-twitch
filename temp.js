/*
   Free Code Camp - Twitch TV
   Author - Varenya
*/

var NavBar = React.createClass({

  handleClick: function (arg,e) {
    e.preventDefault();
    if(arg === "all"){
      this.setState({current:{all:"active",online:"",offline:""}});
    }
    else if(arg === "online"){
      this.setState({current:{all:"",online:"active",offline:""}});
    }
    else{
      this.setState({current:{all:"",online:"",offline:"active"}});
    }
    this.props.onTabChange(arg);
  },

  getInitialState: function () {
    return {current:{all:"active",online:"",offline:""}};
  },

  componentDidMount: function () {
      this.setState({current:{all:"active",online:"",offline:""}});
  },

  render: function () {

    return (
              <ul className="nav nav-tabs nav-justified">
                <li role="presentation" className={this.state.current.all} onClick={this.handleClick.bind(this,"all")}><a href="#">All</a></li>
                <li role="presentation" className={this.state.current.online} onClick={this.handleClick.bind(this,"online")}><a href="#">Online</a></li>
                <li role="presentation" className={this.state.current.offline} onClick={this.handleClick.bind(this,"offline")}><a href="#">Offline</a></li>
              </ul>
    );

  }

});

var MediaList = React.createClass({
  render: function() {
    var style = {
      backgroundColor: 'white',
    };

    function getMediaItems(array,filterby) {
      if(filterby === "online" || filterby === "offline"){
        return array.sort().filter(function(item) {
          return item.status === filterby;
        }).map(function (item) {
          // console.log(item);
          return (<MediaItem {...item} />)
        });
      }
      return array.sort().map(function (item) {
        return (<MediaItem {...item} />)
      });
    }
    var featured_streams = getMediaItems(this.props.streams,this.props.filter);

    return (
        <ul className="media-list" style={style}>
          {featured_streams}
        </ul>
    );
  }
});


var MediaItem = React.createClass({


  getInitialState: function () {
    return {animate: ""};

  },

  componentDidMount: function () {
    this.setState({animate:"bounceInUp animated"});
  },
  render : function() {
    var imgStyle = {"width":64,"height":64};
    // var name = this.props.url.slice(7).split("/")[1].toUpperCase();
     var stream_data;
     if(this.props.status == "online"){
       var subtext = this.props.game_name + this.props.description;
     }
     else if(this.props.status == "offline"){
       var subtext = "offline";
     }
     else{
       var subtext = "Closed";
     }
    // console.log(this.state.status);
    return (
      <li className= {"media " + this.state.animate}>
        <div className="media-left">
          <img src={this.props.logo} style={imgStyle} alt="Stream Pic" className="media-object img-circle" />
        </div>
        <div className="media-body">
          <a href={"http://www.twitch.tv/"+this.props.name}>
            <h4 className="media-heading">{this.props.display_name}</h4>
          </a>
          {subtext}
        </div >
      </li>
    );
  }

});


var Wrapper = React.createClass({

    loadChannels: function () {
         var twich_stream = ["freecodecamp", "storbeck", "terakilobyte", "habathcx","RobotCaleb","thomasballinger","noobs2ninjas","beohoff","esl_sc2","ogamingsc2"];
         var api_url = twich_stream.map(function (item) {
           return "https://api.twitch.tv/kraken/users/"+item+"?callback=?";
         });
         var state_data = [];
         var that = this;
         function jsonwrapper(url,state_data,that) {
           $.ajax({
             type:"GET",
             url:url,
             dataType:"json",
             success: function (data) {
               state_data.push(data);
              //  console.log(state_data);
               that.setState({streams:state_data});
             },
             error:function () {
               console.error("Error occured while fetching");
             }
           });
         }

         api_url.forEach(function (item) {
            jsonwrapper(item,state_data,that);
         });
    },

    loadStreams: function () {

      var twich_stream = ["freecodecamp", "storbeck", "terakilobyte", "habathcx","RobotCaleb","thomasballinger","noobs2ninjas","beohoff","esl_sc2","ogamingsc2","brunofin","comster404"];
      var game_array = [];
      var that = this;
      function getStatus(channel,game_array) {

        function getURL(type,channel) {
          return "https://api.twitch.tv/kraken/"+type+"/"+channel+"?callback=?";
        }

        $.getJSON(getURL("streams",channel),function (data) {
          var game = {};
          if (data.stream === null){
            game.status = "offline";
          }
          else if(data.stream == undefined){
            game.status = "closed";
          }
          else{
            game.status  = "online";
            game.game_name = data.stream.game;
          }
          $.getJSON(getURL("channels",channel),function (data) {
            game.logo = data.logo != null ? data.logo : "http://dummyimage.com/50x50/ecf0e7/5c5457.jpg&text=0x3F";
            game.display_name = data.display_name != null ? data.display_name : channel;
            game.name = data.name;
            game.description = game.status === "online" ? " : "+data.status : "";
            game_array.push(game);
            // console.log("Finale",game);
            //  console.log("Finale List",game_array);
            that.setState({streams: game_array});
          });
        });

        }
      twich_stream.forEach(function (channel) {
        getStatus(channel,game_array);
      });

    },
    getInitialState: function () {
       return {streams: [],filter:"all"}
     },

    componentDidMount:function () {
      //  console.log("inside mount");
       this.loadStreams();
      //  this.loadChannels();
     },
     handleTabChange: function (arg) {
       this.setState({filter:arg});
     },
    render: function() {
      return (
        <div className="container">
          <NavBar onTabChange={this.handleTabChange}/>
          <MediaList streams={this.state.streams} filter={this.state.filter}/>
        </div>
      );
   }

})




ReactDOM.render(<Wrapper initialStream={[]} />,document.getElementById('dummy'));
