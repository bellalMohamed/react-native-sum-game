import React from 'react';
import PropTypes from 'prop-types';

import { View, Text, Button, StyleSheet } from 'react-native';
import RandomNumber from './RandomNumber';

class Game extends React.Component {
    static propTypes = {
        randomNumberCount: PropTypes.number.isRequired,
        initialSeconds: PropTypes.number.isRequired,
        onPlayAgain: PropTypes.func.isRequired
    }

    state = {
        selectedIds: [],
        remainingSeconds: this.props.initialSeconds,
    }
    gameStatus = 'PLAYING';

    randomNumbers = Array.from({length: this.props.randomNumberCount})
        .map(() => 1 + Math.floor(10 * Math.random()));

    target = this.randomNumbers
        .slice(0, this.props.randomNumberCount - 2)
        .reduce((acc, curr) => acc + curr, 0)

    shuffledRandomNumbers = this.shuffle(this.randomNumbers);
    shuffle(array) {
        var currentIndex = array.length, temporaryValue, randomIndex;
        while (0 !== currentIndex) {
            randomIndex = Math.floor(Math.random() * currentIndex);
            currentIndex -= 1;
            temporaryValue = array[currentIndex];
            array[currentIndex] = array[randomIndex];
            array[randomIndex] = temporaryValue;
        }
        return array;
    }

    componentDidMount() {
        this.intervalId = setInterval(() => {
            this.setState((prevState) => {
                return {remainingSeconds: prevState.remainingSeconds -1 };
            }, () => {
                if (this.state.remainingSeconds === 0) {
                    clearInterval(this.intervalId);
                }
            });
        }, 1000);
    }

    componentWillUnmout() {
        clearInterval(this.intervalId);
    }
    isNumberSelected = (numberIndex) => {
        return this.state.selectedIds.indexOf(numberIndex) >= 0;
    }

    UNSAFE_componentWillUpdate(nextProps, nextState) {
        if (
            nextState.selectedIds !== this.state.selectedIds ||
            nextState.remainingSeconds === 0
        ) {
            this.gameStatus = this.calcGameStatus(nextState);
            if (this.gameStatus !== 'PLAYING') {
                clearInterval(this.intervalId);
            }
        }
    }

    calcGameStatus = (nextState) => {
        const sumSelected = nextState.selectedIds.reduce((acc, curr) => {
            return acc + this.shuffledRandomNumbers[curr];
        }, 0);
        if (nextState.remainingSeconds === 0) {
            return 'LOST';
        }
        if (sumSelected < this.target) {
            return 'PLAYING';
        }
        if (sumSelected === this.target) {
            return 'WON';
        }
        if (sumSelected > this.target) {
            return 'LOST';
        }
    }

    selectNumber = (numberIndex) => {
        this.setState((prevState) => ({
            selectedIds: [...prevState.selectedIds, numberIndex],
        }));
    }
    render() {
        const gameStatus = this.gameStatus;
        return (
            <View style={styles.container}>
                <Text style={[styles.target, styles[`STATUS_${gameStatus}`]]}>{this.target}</Text>
                <View style={styles.randomContainer}>
                    {this.shuffledRandomNumbers.map((randomNumber, index) =>
                        <RandomNumber
                            key={index}
                            id={index}
                            isDisabled={this.isNumberSelected(index) || gameStatus !== 'PLAYING'}
                            number={randomNumber}
                            onPress={this.selectNumber}
                        />
                    )}
                </View>
                {this.gameStatus !== 'PLAYING' && (
                    <Button title="Play Again" onPress={this.props.onPlayAgain}/>
                )}
                <Text>{this.state.remainingSeconds}</Text>
            </View>
        );
    }
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#ddd',
    },
    target: {
        fontSize: 40,
        backgroundColor: '#bbb',
        margin: 50,
        textAlign: 'center',
    },
    randomContainer: {
        flex: 1,
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-around',
    },
    randomNumber: {
        backgroundColor: '#999',
        width: 100,
        marginHorizontal: 15,
        marginVertical: 25,
        fontSize: 35,
        textAlign: 'center'
    },
    STATUS_PLAYIN: {
        backgroundColor: '#bbb',
    },
    STATUS_WON: {
        backgroundColor: 'green'
    },
    STATUS_LOST: {
        backgroundColor: 'red'
    }
});

export default Game;
