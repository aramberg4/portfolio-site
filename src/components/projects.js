import React, { Component } from 'react';
import { Tabs, Tab, Card, CardTitle, CardActions, Button, CardMenu, IconButton, CardText } from 'react-mdl';
import pitch from '../resources/pitch.PNG'
import mongodd from '../resources/mongoD&D.png'
class Projects extends Component {
    constructor(props) {
        super(props);
        this.state = { activeTab: 0 };
    }
    render() {
        return(
            <div className="content">
                <Card shadow={0} style={{width: '512px', margin: 'auto'}}>
                    <CardTitle style={{color: '#3494E6', height: '176px', background: `url( ${pitch} ) center / cover`}}>Pitch</CardTitle>
                    <CardText>
                    Angular App that centralizes communication between venues and musicians
                    </CardText>
                    <CardActions border>
                        <Button colored>GitHub</Button>
                    </CardActions>
                    <CardMenu style={{color: '#fff'}}>
                        <IconButton name="share" />
                    </CardMenu>
                </Card>

                <Card shadow={0} style={{width: '512px', margin: 'auto'}}>
                    <CardTitle style={{color: '#3494E6', height: '176px', background: `url( ${mongodd} ) center / cover`}}>MongoD&D</CardTitle>
                    <CardText>
                    Angular App that centralizes communication between venues and musicians
                    </CardText>
                    <CardActions border>
                        <Button colored>GitHub</Button>
                    </CardActions>
                    <CardMenu style={{color: '#fff'}}>
                        <IconButton name="share" />
                    </CardMenu>
                </Card>

                <Card shadow={0} style={{width: '512px', margin: 'auto'}}>
                    <CardTitle style={{color: '#3494E6', height: '176px', background: 'url(https://anthonybonato.files.wordpress.com/2017/06/illustration3.png?w=980&h=400&crop=1) center / cover'}}>PageRank</CardTitle>
                    <CardText>
                    Angular App that centralizes communication between venues and musicians
                    </CardText>
                    <CardActions border>
                        <Button colored>GitHub</Button>
                    </CardActions>
                    <CardMenu style={{color: '#fff'}}>
                        <IconButton name="share" />
                    </CardMenu>
                </Card>
            </div>
        )
    }
}

export default Projects;