import React from 'react';
import Time from 'react-time';
import { List, ListItem, ListItemText, Table, TableBody, TableCell, TableHead, TableRow } from '@material-ui/core';
import { FileSize, getFormattedSize } from './../../helpers';
import { colors } from '../../themes/mender-theme';

export const inlineHeadingStyle = { position: 'absolute', background: colors.expansionBackground, top: -35, padding: 10 };

const METADATA_SPACING = 2;
const style = {
  metadataList: {
    display: 'flex',
    flexDirection: 'row'
  },
  table: {
    background: 'transparent'
  },
  metadataListItem: {
    paddingBottom: '11px',
    borderBottom: '1px solid #e0e0e0',
    marginRight: '2vw'
  },
  payloadHeader: inlineHeadingStyle
};
const attributes = ['Name', 'Checksum', 'Build date', 'Size (uncompressed)'];

export default class ArtifactPayload extends React.PureComponent {
  render() {
    const files = this.props.payload.files || [];
    const summedSize = files.reduce((accu, item) => accu + item.size, 0);
    const metaDataObject = this.props.payload.meta_data || {};
    const metaData = [
      { title: 'Type', value: this.props.payload.type_info.type },
      { title: 'Total Size (uncompressed)', value: getFormattedSize(summedSize) }
    ];
    return (
      <div className="file-details">
        <h4 style={style.payloadHeader}>Payload {this.props.index}</h4>
        <List style={style.metadataList}>
          {metaData.map((item, index) => (
            <ListItem disabled={true} style={style.metadataListItem} classes={{ root: 'attributes', disabled: 'opaque' }} key={`metadata-item-${index}`}>
              <ListItemText primary={item.title} secondary={item.value} />
            </ListItem>
          ))}
        </List>
        <div className="file-meta">
          {Object.keys(metaDataObject).length ? (
            <div>
              <h4>Update Metadata</h4>
              <pre>
                <code>{JSON.stringify(metaDataObject, null, METADATA_SPACING)}</code>
              </pre>
            </div>
          ) : null}
          <h4>Files</h4>
          {files.length ? (
            <Table style={style.table}>
              <TableHead>
                <TableRow>
                  {attributes.map((item, index) => (
                    <TableCell key={`file-header-${index}`} tooltip={item}>
                      {item}
                    </TableCell>
                  ))}
                </TableRow>
              </TableHead>
              <TableBody style={style.table}>
                {files.map((file, index) => {
                  const build_date = <Time value={file.date} format="YYYY-MM-DD HH:mm" />;
                  return (
                    <TableRow key={index}>
                      <TableCell>{file.name}</TableCell>
                      <TableCell style={{ wordBreak: 'break-word' }}>{file.checksum}</TableCell>
                      <TableCell>{build_date}</TableCell>
                      <TableCell>
                        <FileSize fileSize={file.size} />
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          ) : (
            <p>There are no files in this Artifact</p>
          )}
        </div>
      </div>
    );
  }
}
