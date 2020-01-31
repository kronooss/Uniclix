import React from 'react';
import PropTypes from 'prop-types';

import OverviewCard from '../OverviewCard';
import { pageInsightsByType } from "../../../requests/twitter/channels";

class TwitterOverviewCard extends React.Component {
    static propTypes = {
        title: PropTypes.string.isRequired,
        type: PropTypes.string.isRequired,
        icon: PropTypes.string.isRequired,
        setForbidden: PropTypes.func.isRequired
    };

    state = {
        isLoading: false,
        analyticsData: "null"
    }

    getAnalyticsData = () => {
        const {selectedAccount, type} = this.props;

        this.setState(() => ({isLoading: true}));
        pageInsightsByType(selectedAccount, undefined, undefined, type)
            .then((response) => {
                this.setState(() => ({
                    isLoading: false,
                    analyticsData: response
                }));
            })
            .catch((error) => {
                if (error.response.status === 403) {
                    this.props.setForbidden(true);
                } else {
                    this.setState(() => ({isLoading: false}));
                }
            });
    }

    componentDidMount() {
        this.getAnalyticsData();
    }

    componentDidUpdate(prevProps) {
        if (this.props.selectedAccount !== prevProps.selectedAccount) {
            this.getAnalyticsData();
        }
    }

    render() {
        const {title, icon} = this.props;
        const {analyticsData, isLoading} = this.state;

        return <OverviewCard isLoading={isLoading} title={title} ammount={analyticsData} icon={icon} />;
    }
};

export default TwitterOverviewCard;
