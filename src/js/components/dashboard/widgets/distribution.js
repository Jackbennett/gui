import React, { useEffect, useMemo, useState } from 'react';

import { IconButton } from '@material-ui/core';
import { Clear as ClearIcon } from '@material-ui/icons';
import { VictoryGroup, VictoryLabel, VictoryLegend, VictoryPie } from 'victory';

import Loader from '../../common/loader';
import Confirm from '../../common/confirm';
import { chartColorPalette } from '../../../themes/mender-theme';

const seriesOther = '__OTHER__';

export const DistributionReport = ({ attribute, devices, group, groups, onClick, selectGroup, style }) => {
  const [distribution, setDistribution] = useState([]);
  const [removing, setRemoving] = useState(false);

  useEffect(() => {
    initializeDistributionData();
  }, []);

  useEffect(() => {
    initializeDistributionData();
  }, [group, groups, groups[group]?.deviceIds.length]);

  const total = useMemo(() => distribution.reduce((prev, item) => prev + item.y, 0), [distribution]);

  const initializeDistributionData = () => {
    const relevantDevices = group && groups[group] ? groups[group].deviceIds.map(id => devices[id]) : Object.values(devices);
    const distributionByAttribute = relevantDevices.reduce((accu, item) => {
      if (!item.attributes || item.status !== 'accepted') return accu;
      if (!accu[item.attributes[attribute]]) {
        accu[item.attributes[attribute]] = 0;
      }
      accu[item.attributes[attribute]] = accu[item.attributes[attribute]] + 1;
      return accu;
    }, {});
    const distributionByAttributeSorted = Object.entries(distributionByAttribute).sort((pairA, pairB) => pairB[1] - pairA[1]);
    const numberOfItems =
      distributionByAttributeSorted.length > chartColorPalette.length ? chartColorPalette.length - 1 : Object.keys(distributionByAttribute).length;
    const colors = chartColorPalette.slice(0, numberOfItems).reverse();
    var distribution = distributionByAttributeSorted
      .slice(0, colors.length)
      .reduce((accu, [key, value], index) => [{ x: key, y: value, name: key.length > 15 ? key.slice(0, 15) + '...' : key, fill: colors[index] }, ...accu], []);
    if (distributionByAttributeSorted.length > chartColorPalette.length) {
      const others = distributionByAttributeSorted.slice(colors.length).reduce((accu, [, value]) => accu + value, 0);
      distribution.splice(0, 0, { x: seriesOther, name: 'other', y: others, fill: chartColorPalette[chartColorPalette.length - 1] });
    }
    setDistribution(distribution.reverse());
  };

  const onSliceClick = (e, { datum: { x: thing } }) => {
    if (thing != seriesOther) {
      const groupFilters = groups[group]?.filters?.length ? groups[group].filters : [];
      const filters = [...groupFilters, { key: attribute, value: thing, operator: '$eq', scope: 'inventory' }];
      selectGroup(group, filters);
      window.location.replace(`#/devices?${group ? `group=${group}&` : ''}${attribute}=${thing}`);
    }
  };

  const toggleRemoving = () => setRemoving(!removing);

  const formatLabel = ({ datum }) => `${datum.y.toString()} (${(Math.round((datum.y * 1000) / (total || 1)) / 10.0).toString()}%)`;

  return (
    <div className="margin-right margin-bottom widget chart-widget" style={style}>
      {removing ? (
        <Confirm classes="flexbox centered confirmation-overlay" cancel={toggleRemoving} action={onClick} style={{ height: '100%' }} type="chartRemoval" />
      ) : (
        <>
          <div className="flexbox space-between margin-left-small">
            <h4>{group || 'All devices'}</h4>
            <IconButton className="widgetRemover" onClick={toggleRemoving} style={{ alignSelf: 'flex-end' }}>
              <ClearIcon fontSize="small" />
            </IconButton>
          </div>
          {distribution.length ? (
            <VictoryGroup
              style={{
                data: { fill: ({ datum }) => datum.fill },
                parent: { display: 'flex', alignSelf: 'center', height: 'initial', width: 'initial' }
              }}
              data={distribution}
              width={360}
              height={228}
            >
              <VictoryPie
                endAngle={90}
                events={[
                  {
                    target: 'data',
                    eventHandlers: {
                      onClick: onSliceClick
                    }
                  }
                ]}
                labelComponent={<VictoryLabel text={formatLabel} textAnchor={({ datum }) => (datum.startAngle < 0 ? 'end' : 'start')} />}
                radius={75}
                startAngle={-90}
              />
              <VictoryLegend x={30} y={150} width={320} height={65} orientation="horizontal" itemsPerRow={2} gutter={15} rowGutter={-10} />
            </VictoryGroup>
          ) : groups[group]?.filters.length && !groups[group]?.deviceIds.length ? (
            <p className="muted flexbox centered" style={{ height: '100%' }}>
              No devices are part of this group.
            </p>
          ) : (
            <Loader show={true} />
          )}
        </>
      )}
    </div>
  );
};

export default DistributionReport;
