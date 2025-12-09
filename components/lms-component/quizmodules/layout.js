import React, { Component } from 'react'
import Nav from './nav'
import Toggle from './toggle'
import Questions from './questions'
import Sidebar from './sidebar'
import Timestatus from './timestatus'
import Category from './category'
import Summary from './summary'

export default class Layout extends Component {
state={
  open: true
}

toggleHandler =() => {
  this.setState((prevState) => {
    return ({open : !prevState.open})
  })
}
    render() {
        return (
           <div>
                <Nav />
                <Toggle click={this.toggleHandler} open={this.state.open}/>
    <div className="" id="mySidenav" className="sidenav"><Sidebar>
    <Timestatus />
            <Category />
            <Summary />
      </Sidebar></div>
  <>
    <div className=""><Questions /></div>
  </>
 
  <style jsx global>
      {`
      .sidenav {
        height: 100%;
        width: ${this.state.open? '350px' : '0'};
        position: fixed;
        z-index: 1;
        top: 0;
        right: 0;
        background-color: #eee;
        overflow-x: hidden;
        transition: 0.2s;
        padding-top: 60px;
      }
      
      .sidenav a:hover {
        color: #f1f1f1;
      }
      
      .sidenav .closebtn {
        position: absolute;
        top: 0;
        right: 25px;
        font-size: 36px;
        margin-left: 50px;
      }
      .main {
        margin 10rem auto;
        text-align: center;
        width: 60%;
        padding: 0 30px;
        
      }
      
      @media screen and (max-height: 450px) {
        .sidenav {padding-top: 15px;}
        .sidenav a {font-size: 18px;}
        .main {
            font-size:200px;
          }
          .question-num{
              margin-left: 20px;
          }
      }
      
      `}
  </style>
</div>

        )
    }
}
